import { hosting } from "@tgwf/co2";
import pThrottle from "p-throttle";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { getResultFiles } from "./getResultFiles.js";
import { getIndexFiles } from "./getIndexFiles.js";

const trackedIndex = process.env.TRACK_INDEX;

const runGreenCheck = async () => {
  try {
    const indexFiles = await getIndexFiles();
    const resultsFiles = await getResultFiles();

    const indexesToCheck = await Promise.allSettled(indexFiles);
    const greenCheckResults = await Promise.allSettled(resultsFiles);

    indexesToCheck.forEach(async ({ value }) => {
      const { filepath, filename, sites } = value;

      console.log(`Checking ${filename}...`);

      // Check if the file has been checked before. Get all the result files for this file and sort by timestamp
      const previousResults = greenCheckResults
        .filter(({ value }) => value.for === filepath)
        .sort((a, b) => {
          return new Date(b.value.timestamp) - new Date(a.value.timestamp);
        })
        .shift();

      // Check if the file's timestamp is within the last two weeks
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 14);
      const fileTimestamp = new Date(previousResults?.value.timestamp || 0);
      if (fileTimestamp > lastWeek && trackedIndex !== filename) {
        console.log(
          `Skipping ${filename} as it was checked in the past two weeks.`,
        );
        return [];
      }

      // Flatten the array of arrays
      const sitesArray = sites.flat().map((site) => {
        try {
          return new URL(site).hostname;
        } catch (error) {
          return site;
        }
      });

      // Group sites into batches of 3
      const sitesBatched = sitesArray.reduce((acc, site, i) => {
        const index = Math.floor(i / 20);
        if (!acc[index]) {
          acc[index] = [];
        }
        acc[index].push(site);
        return acc;
      }, []);

      // Run the check for each site
      const checkSite = pThrottle({ limit: 1, interval: 1000 });

      const throttled = checkSite(async (sites) => {
        const results = await hosting(sites, { verbose: true });
        // console.log('Throttled results:', results);
        return results;
      });

      const greenDomains = [];

      sitesBatched.forEach(async (sites) => {
        greenDomains.push(throttled(sites));
      });

      const results = await Promise.allSettled(greenDomains);
      const timestamp = new Date().toISOString();
      const greenResults = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value)
        .map((batch) => {
          // Convert object of objects into array of objects
          return Object.entries(batch).map(
            ([url, hosted_by, hosted_by_id, green, modified, data]) => ({
              url: data?.url || url,
              hosted_by: data?.hosted_by || hosted_by,
              green: data?.green || green,
              hosted_by_id: data?.hosted_by_id || hosted_by_id,
              modified: data?.modified || modified,
            }),
          );
        })
        .flat();

      // Ensure the greenChecks directory exists
      const checksDir = path.join(process.cwd(), "src/_data/checks");
      await mkdir(checksDir, { recursive: true });

      const outputData = {
        timestamp,
        sourceFile: filepath,
        data: greenResults,
        greenDomains: greenResults.filter((result) => result.green).length,
        totalSites: greenResults.length,
      };

      const fileName = `green_${filename}_${timestamp.replace(/[:.]/g, "-")}.json`;
      const outputPath = path.join(checksDir, fileName);

      await writeFile(outputPath, JSON.stringify(outputData));
      return greenResults;
    });
  } catch (error) {
    console.error("Error running green check:", error);
  }
};

runGreenCheck();
