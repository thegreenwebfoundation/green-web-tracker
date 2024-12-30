import fg from 'fast-glob'

export const getResultFiles = async (filename = null) => {
    try {
        const greenCheckResultFiles = filename ? await fg(`src/_data/checks/green_${filename}_*.json`) : await fg('src/_data/checks/*.json');
    
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