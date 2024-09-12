import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

if (process.argv.length < 3) {
  console.error(
    `${process.argv[0]} ${process.argv[1]} [path to project]
        Make sure you have installed the project with npm install and that it is buildable before running this script`
  );
  process.exit(1);
}

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

function findSimilarities(findingsObj: any, slitherObj: any): any {
  //console.log(findingsObj);
  for (const finding of findingsObj.findings) {
    for (const detector of slitherObj.results.detectors) {
      for (const element of detector.elements) {
        let regex = /(?:([0-9]+)-([0-9]+),?)|(?:([0-9]+),?)/g;
        let matches = [...finding.lines.matchAll(regex)];
        if (matches.length == 0) break;
        let is_same_file = false;
        for (const vuln_fun of finding.vulnerable_functions) {
          is_same_file =
            is_same_file ||
            vuln_fun.startsWith(
              element.source_mapping.filename_short.match(
                /[.\/]??([\w-]+)\.sol/
              )[1]
            );
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
          if (is_same_file && intersect) {
            if (!finding.possible_found_in) finding.possible_found_in = [];
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
        }
      }
    }
  }
  return findingsObj;
}

function listFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      listFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

interface ProjectInfo {
  vulnProjectFiles: string[];
  patchedProjectFiles: string[];
  slitherResult: any;
  findingsFile: string;
}
interface Projects {
  [key: string]: ProjectInfo;
}

function findForTruffleOrHardhatProjects(basePath: string): Projects {
  let files = listFiles(basePath).filter(
    (v) =>
      (v.includes("vulnerable") || v.includes("patched")) &&
      (v.includes("truffle-config.js") ||
        v.includes("buidler.config.ts") ||
        v.includes("hardhat.config.ts") ||
        v.includes("hardhat.config.js") ||
        v.includes("findings.json"))
  );

  let basePaths: Set<string> = new Set();
  for (const file of files) {
    let lastfound = 0;
    let found = 0;
    let basePath = "";
    let lastBasePath = "";
    do {
      lastfound = found;
      lastBasePath = basePath;
      basePath = file.substring(
        0,
        file.indexOf("/", basePath.length ? basePath.length + 1 : undefined)
      );
      found = files.filter((v) => v.startsWith(basePath)).length;
    } while (found >= lastfound && basePath != "");
    basePaths.add(lastBasePath);
  }
  let projects: Projects = {};
  for (let path of basePaths) {
    let projFiles = files.filter(
      (v) =>
        v.startsWith(path) &&
        (v.includes("truffle-config.js") ||
          v.includes("buidler.config.ts") ||
          v.includes("hardhat.config.ts") ||
          v.includes("hardhat.config.js"))
    );
    let findFiles = files.filter(
      (v) => v.startsWith(path) && v.includes("findings.json")
    );
    projects[path] = {
      findingsFile: findFiles[0],
      vulnProjectFiles: projFiles.filter((v) => v.includes("vulnerable")),
      patchedProjectFiles: projFiles.filter((v) => v.includes("patched")),
      slitherResult: {},
    };
  }
  return projects;
}

async function runSlither(project: ProjectInfo) {
  let findings = await readFile(project.findingsFile);
  let slitherOutput: string = "";
  for (let path of project.vulnProjectFiles) {
    if (path.includes("openzeppelin")) continue;
    console.log(path);
    let installPath = path.substring(0, path.lastIndexOf("/"));
    let promise = new Promise<any>((resolve, reject) => {
      exec(
        "slither . --json -",
        {
          cwd: installPath,
          maxBuffer: 20 * 1024 * 1024,
        },
        (err, stdout, stderr) => {
          try {
            let retval = JSON.parse(stdout);
            if (retval.success) {
              resolve(retval);
            } else {
              throw err;
            }
          } catch (error) {
            reject({
              err: err,
              stderr: stderr,
              stdout: stdout,
              path: installPath,
            });
          }
        }
      );
    });
    try {
      slitherOutput = await promise;
      findings = findSimilarities(findings, slitherOutput);
    } catch (error) {
      console.log(error);
    }
  }
  fs.writeFileSync(
    project.findingsFile.substring(0, project.findingsFile.lastIndexOf("/")) +
      "/findings-slither-vuln.json",
    JSON.stringify(findings, null, 4)
  );
  fs.writeFileSync(
    project.findingsFile.substring(0, project.findingsFile.lastIndexOf("/")) +
      "/slither-vuln.json",
    JSON.stringify(slitherOutput, null, 4)
  );

  slitherOutput = "";
  for (let path of project.patchedProjectFiles) {
    console.log(path);
    let installPath = path.substring(0, path.lastIndexOf("/"));
    let promise = new Promise<any>((resolve, reject) => {
      exec(
        "slither . --json -",
        {
          cwd: installPath,
          maxBuffer: 20 * 1024 * 1024,
        },
        (err, stdout, stderr) => {
          try {
            let retval = JSON.parse(stdout);
            if (retval.success) {
              resolve(retval);
            } else {
              throw err;
            }
          } catch (error) {
            reject({
              err: err,
              stderr: stderr,
              stdout: stdout,
              path: installPath,
            });
          }
        }
      );
    });
    try {
      slitherOutput = await promise;
    } catch (error) {
      console.log(error);
    }
  }
  fs.writeFileSync(
    project.findingsFile.substring(0, project.findingsFile.lastIndexOf("/")) +
      "/slither-patched.json",
    JSON.stringify(slitherOutput, null, 4)
  );
}

async function run() {
  let projects = findForTruffleOrHardhatProjects(process.argv[2]);
  for (let project in projects) {
    await runSlither(projects[project]);
  }
}

run();
