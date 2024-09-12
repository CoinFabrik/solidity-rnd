import * as fs from "fs";
import * as path from "path";
import * as readlineSync from "readline-sync";

function readFile(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function intervalIntersect(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 <= end2 && start2 <= end1;
}

function formatElementLines(element: any): any {
  try {
    element.source_mapping.lines = element.source_mapping.lines.join(", ");
    element.type_specific_fields.parent.source_mapping.lines =
      element.type_specific_fields.parent.source_mapping.lines.join(", ");
    element.type_specific_fields.parent.type_specific_fields.parent.source_mapping.lines =
      element.type_specific_fields.parent.type_specific_fields.parent.source_mapping.lines.join(
        ", "
      );
  } catch (err) {}
  return element;
}

function findFunctionInDescription(
  FunctionsObj: any,
  detectorDescription: string
): boolean {
  let isInDescription = false;
  for (const functionString of FunctionsObj) {
    let functionName = functionString.split("::")[1].replace(/\(\)/g, "");
    let fileName = functionString.split("::")[0];
    if (
      (functionName == "*" || functionName == "") &&
      detectorDescription.includes(fileName)
    ) {
      return true;
    }

    if (detectorDescription.includes(functionName)) {
      isInDescription = true;
    }
  }
  return isInDescription;
}

function addPossibleFoundIn(finding: any, element: any, detector: any) {
  finding.possible_found_in.push({
    element: element,
    detector: {
      description: detector.description,
      markdown: detector.markdown,
      first_markdown_element: detector.first_markdown_element,
      id: detector.id,
      check: detector.check,
      impact: detector.impact,
      confidence: detector.confidence,
    },
  });
}

function findSimilarities(
  findingsObj: any,
  slitherObj: any,
  filter: number,
  filterType: string
): any {
  let previous_id = "";
  let hasLines = true;
  for (const finding of findingsObj.findings) {
    for (const detector of slitherObj.results.detectors) {
      for (let element of detector.elements) {
        let regex = /(?:([0-9]+)-([0-9]+),?)|(?:([0-9]+),?)/g;
        let matches = [...finding.lines.matchAll(regex)];
        if (matches.length == 0) break;
        let is_same_file = false;

        for (const vuln_fun of finding.vulnerable_functions) {
          //console.log(element);

          let fun = vuln_fun.split("::")[0].split(".")[0];
          is_same_file =
            is_same_file ||
            fun ===
              element.source_mapping.filename_short.match(
                /[.\/]??([\w-]+)\.sol/
              )[1];
        }
        for (let match of matches) {
          let intersect = match[3]
            ? intervalIntersect(
                element.source_mapping.lines[0],
                element.source_mapping.lines[
                  element.source_mapping.lines.length - 1
                ],
                Number(match[3]),
                Number(match[3])
              )
            : intervalIntersect(
                element.source_mapping.lines[0],
                element.source_mapping.lines[
                  element.source_mapping.lines.length - 1
                ],
                Number(match[1]),
                Number(match[2])
              );

          if (intersect && is_same_file) {
            if (previous_id != detector.id) {
              if (
                findFunctionInDescription(
                  finding.vulnerable_functions,
                  detector.description
                )
              ) {
                if (!finding.possible_found_in) finding.possible_found_in = [];

                //element = formatElementLines(element);
                if (
                  (filter == 1 && detector.confidence === filterType) ||
                  (filter == 2 && detector.impact === filterType) ||
                  (filter == 3 && detector.check.includes(filterType)) ||
                  filter == 0
                ) {
                  addPossibleFoundIn(finding, element, detector);
                  previous_id = detector.id;
                }
              }
            }
          }
        }
      }
    }
  }
  return findingsObj;
}

async function compareFindings(projectPath: string, filter: number) {
  let input: string = "";
  switch (filter) {
    case 0:
      break;
    case 1:
      input = readlineSync.question(
        "Please enter Confidence level.\nPossible options:\n- High\n- Medium\n- Low\n"
      );
      break;
    case 2:
      input = readlineSync.question(
        "Please enter Severity level.\nPossible options:\n- Critical\n- High\n- Medium\n- Low\n- Informational\n"
      );
      break;
    case 3:
      input = readlineSync.question(
        "Possible options can be found in https://github.com/crytic/slither/wiki/Detector-Documentation\nPlease enter Vulnerability class: "
      );
      break;
    default:
      console.error("Invalid filter option.");
      return;
  }
  try {
    const findingsPath = path.join(projectPath, "vulnerable", "findings.json");
    const slitherOutputPath = path.join(
      projectPath,
      "vulnerable",
      "slither-vuln.json"
    );
    const outputPath = path.join(
      projectPath,
      "vulnerable",
      "findings-slither-vuln-filtered.json"
    );

    const findings = await readFile(findingsPath);
    const slitherOutput = await readFile(slitherOutputPath);
    const updatedFindings = findSimilarities(
      findings,
      slitherOutput,
      filter,
      input
    );
    fs.writeFileSync(outputPath, JSON.stringify(updatedFindings, null, 4));
    console.log("Comparison completed and results saved to", outputPath);
  } catch (error) {
    console.error("Error reading or processing files:", error);
  }
}

// Example usage:
// node script.js [path to project]
if (process.argv.length < 4) {
  console.error(
    "Usage: ts-node filter_slither_results.ts [path to project] [Options]"
  );
  console.error(
    "Possible options filter:\n- No filter = 0\n- Confidence = 1\n- Severity = 2\n- Vulnerability class = 3"
  );
  process.exit(1);
}

const [projectPath, filter] = process.argv.slice(2);
compareFindings(projectPath, Number(filter));
