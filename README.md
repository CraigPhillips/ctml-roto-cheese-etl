CTML Roto Cheese
==============

This ETL is responsible for pulling matchup data from the CTML fantasy baseball
league and then calculating and storing weekly rotiserrie-style scoring results
in S3 for later consumption by the CTML Roto Cheese UI.

Currently the ETL is implemented as a Lambda function which is triggered
periodically by a CloudWatch event and uses
[Puppeteer](https://github.com/GoogleChrome/puppeteer) to simulate a user
logging into the Yahoo fantasy baseball website and scrape matchup data before
publishing it to S3 for consumption.

## Instructions for use
### Basic setup
1. clone this repository to an environment with [Node][2] v11.9.0 or later
available
1. run `npm i` to retrieve all dependencies
1. copy `.template.env` to `.env`
1. set values for all environment variables in the new file
1. install the [AWS CLI][3] and configure with a set of credentials that have
access to the S3 buckets specified in the last step and deployment permissions

### Running the ETL locally
1. run `npm run etl`
1. view output logs and any screenshots added to the `screenshots` folder
1. inspect published results directly in the target S3 bucket or by viewing the
[UI that consumes the output][4].

### Deploying the ETL to AWS
1. run `npm run deploy`
1. view output logs for progress
1. manually trigger the resulting Lambda function to make sure it runs
1. view the CloudWatch logs after the timed CloudWatch event triggers

### Running tests
1. run `npm test`

### Viewing code coverage rates
1. run `npm run coverage-report`
1. view results through a browser by viewing `coverage/lcov-report/index.html`

## License
The source found in this repository can be used under the open source
[MIT License][1].

[1]:./LICENSE
[2]:https://nodejs.org/en/
[3]:https://aws.amazon.com/cli/
[4]:http://cheese.frozenexports.net
