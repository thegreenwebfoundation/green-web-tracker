import fg from 'fast-glob';

export const getIndexFiles = async (dataDir = "_data") => {
    try {
        const filesToCheck = await fg(`src/${dataDir}/indexes/*.json`);

        // Read the content of each file, and get the list of sites to check
        const sitesToCheck = filesToCheck.map(async (file) => {
            const data = await import(`../${file}`, { with: { type: 'json' } }).then((data) => {
                return {
                    filepath: file,
                    filename: file.replace(`src/${dataDir}/indexes/`, '').replace('.json', ''),
                    sites: data.default.sites,
                };
            });

            return data;
        });

        return sitesToCheck;
    } catch (error) {
        console.error('Error reading indexes directory:', error);
        return [];
    }
}