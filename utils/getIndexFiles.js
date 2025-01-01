import fg from 'fast-glob';
const dev = process.env.ELEVENTY_RUN_MODE === 'serve';

export const getIndexFiles = async (dataDir = "_data") => {
    try {
        let filesToCheck = await fg(`src/${dataDir}/indexes/*.json`);

        // Read the content of each file, and get the list of sites to check
        const sitesToCheck = filesToCheck.map(async (file) => {
            const data = await import(`../${file}`, { with: { type: 'json' } }).then((data) => {

                if (dev) {
                    data.default.sites = data.default.sites.slice(0, 10);
                }
                
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