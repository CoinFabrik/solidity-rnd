import * as fs from 'fs';
import * as path from 'path';



const folders: string[] = [
    "./deedzCoin", "./Diverse", "./emdx-dex", "./farcana", "./foreProtocol", "./litLab", "./neptune", "./venusProtocol", "./WarpedGames"
];

const processFindingFiles = (folders: string[]) => {
    let totalObjects = 0;
    const cweClassificationCounts: Record<string, number> = {};
    const vulnerabilityClassCounts: Record<string, number> = {};
    const vulnerabilitySubclassCounts: Record<string, number> = {};
    folders.forEach(folder => {
        const findingFilePath = path.join(folder, 'vulnerable', 'fiding.json');

        if (fs.existsSync(findingFilePath)) {
            const rawData = fs.readFileSync(findingFilePath, 'utf-8');
            const jsonData = JSON.parse(rawData);
            const fiddingArray = jsonData.findings;

            if (Array.isArray(fiddingArray)) {
                const numObjects = fiddingArray.length;
                totalObjects += numObjects;
                console.log(`archivo ${findingFilePath} tiene ${numObjects} vulnerabilidades.`);

                fiddingArray.forEach((item: any) => {
                    if (item.cwe_classification) {
                        cweClassificationCounts[item.cwe_classification] = (cweClassificationCounts[item.cwe_classification] || 0) + 1;
                    }
                    if (item.vulnerability_class) {
                        vulnerabilityClassCounts[item.vulnerability_class] = (vulnerabilityClassCounts[item.vulnerability_class] || 0) + 1;
                    }
                    if (item.vulnerability_subclass) {
                        vulnerabilitySubclassCounts[item.vulnerability_subclass] = (vulnerabilitySubclassCounts[item.vulnerability_subclass] || 0) + 1;
                    }
                });
            }
        }
    });
    console.log(`total de ${totalObjects} vulnerabilidades.`)
    console.log('total de cwe_classification:', cweClassificationCounts);
    console.log('total de vulnerability_class:', vulnerabilityClassCounts);
    console.log('total de vulnerability_subclass:', vulnerabilitySubclassCounts);

};

processFindingFiles(folders);