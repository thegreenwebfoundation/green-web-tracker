import {getResultFiles} from './utils/getResultFiles.js'

const dev = process.env.ELEVENTY_RUN_MODE === 'serve';

export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('src')
    if (dev) {
        eleventyConfig.setDataDirectory('_dev-data');
    }

    eleventyConfig.addFilter("greenHostsCount", async (index, filename) => {
        const dataDir = dev ? '_dev-data' : '_data';
        const resultsFiles = await getResultFiles(filename, dataDir);
        const greenCheckResults = await Promise.allSettled(resultsFiles);

        const previousResults = greenCheckResults.sort((a, b) => {
            return new Date(b.value.timestamp) - new Date(a.value.timestamp);
        }).shift();

        return previousResults.value.greenDomains.length;
    });
};