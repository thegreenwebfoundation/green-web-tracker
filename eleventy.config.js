import {getResultFiles} from './utils/getResultFiles.js'
import {getIndexFiles} from './utils/getIndexFiles.js'

const dev = process.env.ELEVENTY_RUN_MODE === 'serve';
const dataDir = '_data';

const indexFiles = await getIndexFiles(dataDir);
const resultsFiles = await getResultFiles(null, dataDir);

export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('src')
    eleventyConfig.addPassthroughCopy({"public": "/"});
    eleventyConfig.addWatchTarget("./src/styles/");

    eleventyConfig.addAsyncFilter("greenHostsCount", async (index, filename) => {
        const indexResults = await getResultFiles(filename, dataDir);
        const greenCheckResults = await Promise.allSettled(indexResults);

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

        let domain = site;
        try {
            domain = new URL(site).hostname;
        } catch (error) {
            domain = site;
        }

        // There's three conditions - green: true, green: false, and the domain not being in the results
        if (result.data.find(data => data.url === domain) === undefined) {
            return 'not-checked';
        }

        const greenResults = result.data.filter(data => data.url === domain && data.green);

        
        return greenResults.length > 0 ? true : false;
    });
    
    eleventyConfig.addAsyncShortcode("getUniqueDomains", async () => {
        const indexResults = await Promise.allSettled(indexFiles);

        const results = indexResults.map(({ value }) => value);
        const sites = results.map(result => result.sites).flatMap(site => {
            try {
                return new URL(site).hostname
            } catch (error) {
                return site;
            }
        });

        const uniqueSites = [...new Set(sites)];

        return uniqueSites.length;
    });

    eleventyConfig.addAsyncShortcode("getGreenCount", async () => {
        const greenCheckResults = await Promise.allSettled(resultsFiles);

        const results = greenCheckResults.map(({ value }) => value);
        const data = results.flatMap(result => result.data).filter(data => data.green).map(data => data.url).map(site => {
            try {
                return new URL(site).hostname
            }
            catch (error) {
                return site;
            }
        });

            const uniqueGreenSites = [...new Set(data)];

            return uniqueGreenSites.length;
        });

    eleventyConfig.addAsyncShortcode("getLastChecked", async () => {
        const greenCheckResults = await Promise.allSettled(resultsFiles);

        const results = greenCheckResults.map(({ value }) => value);
        const lastChecked = results.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        }).shift();

        return lastChecked.timestamp;
    });


    eleventyConfig.addAsyncShortcode("getIndexCount", async () => {
        const indexResults = await Promise.allSettled(indexFiles);
        return indexResults.length;
    }); 

    eleventyConfig.addGlobalData("domainsList", async () => {
        const indexResults = await Promise.allSettled(indexFiles);

        const results = indexResults.map(({ value }) => value);
        const sites = results.map(result => result.sites).flatMap(site => {
            try {
                return new URL(site).hostname
            } catch (error) {
                return site;
            }
        });

        const uniqueSites = [...new Set(sites)]

        return uniqueSites;
    });

    eleventyConfig.addFilter("toHost", (url) => {
        let domain = url;
        try {
            domain = new URL(url).hostname;
        } catch (error) {
            domain = url;
        }

        return domain;
    });

    eleventyConfig.addAsyncFilter("findDomainInIndexes", async (domain) => {
        const indexResults = await Promise.allSettled(indexFiles);

        const results = indexResults.map(({ value }) => value);
        const indexes = results.map(result => result.sites);

        let indexCount = 0;

        indexes.forEach(index => {
        index.forEach(site => {
                let siteDomain = site;
                try {
                    siteDomain = new URL(site).hostname;
                } catch (error) {
                    siteDomain = site;
                }

                if (siteDomain === domain) {
                    indexCount++;
                }
            });
        });


        return indexCount;
    });

    eleventyConfig.addAsyncFilter("listDomainIndexes", async (domain) => {
        const indexResults = await Promise.allSettled(indexFiles);

        const results = indexResults.map(({ value }) => value);
        const indexes = results.map(result => result);

        const data = indexes.filter(index => index.sites.includes(domain));

        return data;
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

    eleventyConfig.addAsyncFilter("uniqueResultDomains", async (results) => {
        const data = results.flatMap(result => result.data).map(data => data.url).map(site => {
            try {
                return new URL(site).hostname
            }
            catch (error) {
                return site;
            }
        });

        const uniqueSites = [...new Set(data)];
    

        return uniqueSites;
    });


    eleventyConfig.addFilter("plural", (length, plural, singular) => {
        return length > 1 ? plural : singular;
    });
};