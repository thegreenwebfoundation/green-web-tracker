import {getResultFiles} from './utils/getResultFiles.js'

const dev = process.env.ELEVENTY_RUN_MODE === 'serve';

export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('src')
    eleventyConfig.addPassthroughCopy({"public": "/"});
    eleventyConfig.addWatchTarget("./src/styles/");

    if (dev) {
        eleventyConfig.setDataDirectory('_dev-data');
    }

    eleventyConfig.addAsyncFilter("greenHostsCount", async (index, filename) => {
        const dataDir = dev ? '_dev-data' : '_data';
        const resultsFiles = await getResultFiles(filename, dataDir);
        const greenCheckResults = await Promise.allSettled(resultsFiles);

        const previousResults = greenCheckResults.sort((a, b) => {
            return new Date(b.value.timestamp) - new Date(a.value.timestamp);
        }).shift();

        return previousResults.value.greenDomains.length;
    });

    eleventyConfig.addAsyncFilter("getIndexResults", async (filename) => {
        const dataDir = dev ? '_dev-data' : '_data';
        const resultsFiles = await getResultFiles(filename, dataDir);
        const greenCheckResults = await Promise.allSettled(resultsFiles);

        const results = greenCheckResults.sort((a, b) => {
            return new Date(b.value.timestamp) - new Date(a.value.timestamp);
        }).map(({ value }) => value);

        return results;
    });

    eleventyConfig.addAsyncFilter("latestResult", async (results) => {
        return results.shift();
    });

    eleventyConfig.addAsyncFilter("getGreenStatus", async (result, site) => {
        let domain = new URL(site).hostname;
        return result.greenDomains.includes(domain);
    });
};