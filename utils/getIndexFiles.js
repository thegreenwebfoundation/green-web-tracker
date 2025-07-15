import fg from 'fast-glob';
const dev = process.env.ELEVENTY_RUN_MODE === 'serve';
const trackedIndex = process.env.TRACK_INDEX;
console.log('getIndexFiles - trackedIndex', trackedIndex)
export const getIndexFiles = async (dataDir = "_data") => {
    try {
        let filesToCheck = await fg(`src/${dataDir}/indexes/*.json`);

        // Read the content of each file, and get the list of sites to check
        const sitesToCheck = filesToCheck.map(async (file) => {
            const data = await import(`../${file}`, { with: { type: 'json' } }).then((data) => {

                const index = {
                    filepath: file,
                    filename: file.replace(`src/${dataDir}/indexes/`, '').replace('.json', ''),
                    sites: data.default.sites,
                };

                if (dev && index.filename !== trackedIndex) {
                    index.sites = index.sites.slice(0, 10);
                }

                return index;
            });

            return data;
        });

        return sitesToCheck;
    } catch (error) {
        console.error('Error reading indexes directory:', error);
        return [];
    }
}
