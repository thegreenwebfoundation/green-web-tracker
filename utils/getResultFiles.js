import fg from 'fast-glob'
const dev = process.env.ELEVENTY_RUN_MODE === 'serve';
const trackedIndex = process.env.TRACK_INDEX;

export const getResultFiles = async (filename = null, dataDir = "_data") => {
    try {
        let greenCheckResultFiles = filename ? await fg(`src/${dataDir}/checks/green_${filename}_*.json`) : await fg(`src/${dataDir}/checks/*.json`);
    
            const greenCheckResults = greenCheckResultFiles.map(async (file) => {
                const data = await import(`../${file}`, { with: { type: 'json' } }).then((data) => {

                    const result = {
                        filepath: file,
                        for: data.default.sourceFile,
                        timestamp: data.default.timestamp,
                        greenDomains: data.default.greenDomains,
                        data: data.default.data,
                        totalSites: data.default.totalSites, 
                    };

                    if (dev && filename !== trackedIndex) {
                        result.data = result.data.slice(0, 10);
                    }

                    return result;
                });
    
                return data;
            });
    
            return greenCheckResults;
    } catch (error) {
        console.error('Error reading checks directory:', error);
        return [];
    }
}
