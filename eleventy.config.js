import {getResultFiles} from './utils/getResultFiles.js'
import {getIndexFiles} from './utils/getIndexFiles.js'

const dev = process.env.ELEVENTY_RUN_MODE === 'serve';
const dataDir = dev ? '_dev-data' : '_data';

const indexFiles = await getIndexFiles(dataDir);
const resultsFiles = await getResultFiles(null, dataDir);

export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('src')
    eleventyConfig.addPassthroughCopy({"public": "/"});
    eleventyConfig.addWatchTarget("./src/styles/");

    if (dev) {
        eleventyConfig.setDataDirectory('_dev-data');
    }

    eleventyConfig.addAsyncFilter("greenHostsCount", async (index, filename) => {
        const greenCheckResults = await Promise.allSettled(resultsFiles);

        const previousResults = greenCheckResults.sort((a, b) => {
            return new Date(b.value.timestamp) - new Date(a.value.timestamp);
        }).shift();

        return previousResults.value.greenDomains;
    });

    eleventyConfig.addAsyncFilter("getIndexResults", async (filename) => {
        const indexResults = await getResultFiles(filename, dataDir);
        const greenCheckResults = await Promise.allSettled(indexResults);

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

        const greenResults = result.data.filter(data => data.url === domain && data.green);
        return greenResults.length > 0 ? true : false;
    });
    
    eleventyConfig.addAsyncShortcode("getUniqueDomains", async () => {
        const indexResults = await Promise.allSettled(indexFiles);

        const results = indexResults.map(({ value }) => value);
        const sites = results.map(result => result.sites).flat();
        const uniqueSites = [...new Set(sites)];

        return uniqueSites.length;
    });

    eleventyConfig.addAsyncShortcode("getIndexCount", async () => {
        const indexResults = await Promise.allSettled(indexFiles);
        return indexResults.length;
    }); 

    eleventyConfig.addGlobalData("domainsList", async () => {
        const indexResults = await Promise.allSettled(indexFiles);

        const results = indexResults.map(({ value }) => value);
        const sites = results.map(result => result.sites).flat();
        const uniqueSites = [...new Set(sites)].map(site => 
            new URL(site).hostname
        )

        return uniqueSites;
    });

    eleventyConfig.addFilter("toHost", (url) => {
        return new URL(url).hostname;
    });

    eleventyConfig.addAsyncFilter("findDomainInIndexes", async (domain) => {
        const indexResults = await Promise.allSettled(indexFiles);

        const results = indexResults.map(({ value }) => value);
        const indexes = results.map(result => result.sites);

        let indexCount = 0;

        indexes.forEach(index => {
            index.forEach(site => {
                const siteDomain = new URL(site).hostname;
                if (siteDomain === domain) {
                    indexCount++;
                }
            });
        });


        return indexCount;
        // return uniqueSites.includes(domain);
    });

    eleventyConfig.addAsyncFilter("getDomainResults", async (domain) => {
        const greenCheckResults = await Promise.allSettled(resultsFiles);

        const domainResults = greenCheckResults.filter(({ value }) => {
            return value.data.some(data => data.url === domain);
        }).map(({ value }) => {
            return {
                timestamp: value.timestamp,
                data: value.data.filter(data => data.url === domain),
            }
        });
        
        // Get unique results based on the timestamp in date format, exlcuding the time
        const uniqueResults = [...new Map(domainResults.map(item => [new Date(item.timestamp).toDateString(), item])).values()];

        return uniqueResults;
    });


    eleventyConfig.addFilter("plural", (length, plural, singular) => {
        return length > 1 ? plural : singular;
    });
};