import fg from 'fast-glob'

export const getResultFiles = async (filename = null, dataDir = "_data") => {
    try {
        const greenCheckResultFiles = filename ? await fg(`src/${dataDir}/checks/green_${filename}_*.json`) : await fg(`src/${dataDir}/checks/*.json`);
    
            const greenCheckResults = greenCheckResultFiles.map(async (file) => {
                const data = await import(`../${file}`, { with: { type: 'json' } }).then((data) => {
                    return {
                        filepath: file,
                        for: data.default.sourceFile,
                        timestamp: data.default.timestamp,
                        greenDomains: data.default.greenDomains,
                    };
                });
    
                return data;
            });
    
            return greenCheckResults;
    } catch (error) {
        console.error('Error reading checks directory:', error);
        return [];
    }
}