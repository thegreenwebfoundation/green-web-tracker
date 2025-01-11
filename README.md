# Green Web Tracker

Tracking the progress of the internet towards 100% fossil free hosting. Updated weekly.

## Overview

The Green Web Tracker project is an open-source initiative to track the green hosting status of public websites over time. The project is maintained by the Green Web Foundation, and based on data from the Green Web Dataset - the world's largest open dataset of verified green hosting providers.

Learn more at [https://tracker.greenweb.org/about](https://tracker.greenweb.org/about).

## Submitting a Public Index

1. Fork this repository
2. Create a `json` new file in the `src/indexes/` folder and give it a name (e.g  `your-index-name.json`)
3. Copy the following template into the new file, and fill in the details for your index:

```json
{
    "name": "My Index",
    "description": "A description of the index.",
    "contributors": [
        {
        "name": "Your Name",
        "github": "your-github-username"
        }
    ],
    "sources": [
        {
            "name": "Source Name",
            "url": "https://example.com"
        }
    ],
    "sites": [
        "example.com",
        "example.org"
    ],
}
```

Descriptions of each key is below:

- `name`: The human readable name of your index
- `description`: A brief description of what this index tracks
- `contributors`: Your name and GitHub username
- `sources`: (Optional) Any sources you used to create the index
- `sites`: Array of domain names to track

4. Commit your changes to your fork.
5. Create a Pull Request in the [`thegreenwebfoundation/green-web-tracker`](https://github.com/thegreenwebfoundation/green-web-tracker) repository to merge in your changes.

## Local development

After cloning or forking this repository, run the following commands to install all dependencies and start the dev server.

```shell
npm install
npm run start
```

Please note that for performance reasons, in developement only data for the first 10 domains of any index will be used. Other domains will show a "not checked" result.

## Self-hosting

Users wishing to host their own index can:

1. Fork this project in GitHub
2. Remove any unwanted indexes and check results from the `src/_data/indexes` and `src/_data/checks` folders
3. Add any of their own indexes that they want to track to the `src/_data/indexes` folder
4. Run the `npm run greencheck` command to check the index

This library includes a GitHub action to automatically run the `npm run greencheck` command on a weekly basis (every Thursday). This action checks the sites included in all indexes found in the `src/_data/indexes` folder, and outputs their results to the `src/_data/indexes` folder. A pull request is then created with the updated data.

## License

This project is licensed under the Apache 2.0 License.

## Acknowledgments

Built with [Eleventy](https://www.11ty.dev/)
Powered by the [Green Web Foundation](https://www.thegreenwebfoundation.org/)
Uses the [@tgwf/co2 package](https://www.npmjs.com/package/@tgwf/co2)
