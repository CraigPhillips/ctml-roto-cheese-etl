CTML Roto Cheese
==============

This ETL is responsible for pulling matchup data from the CTML fantasy baseball
league and then calculating and storing weekly rotiserrie-style scoring results
in S3 for later consumption by the CTML Roto Cheese UI.

## Instructions for use
1. clone this repository to an environment with [Node][2] v8.10.0 or later
available
1. run `npm i` to retrieve all dependencies
1. in `index.js`, populate values for the `FE_CHEESE_YAHOO_USER`,
`FE_CHEESE_YAHOO_PASS` and `FE_CHEESE_PUB_BUCKET` properties
1. install the [AWS CLI][3] and configure with a set of credentials that have
access to the S3 bucket specified in the last step
1. ensure that the user whose credentials are specified above has access to the
CTML league's homepage to be able to read scores
1. run `node index.js` and watch the logged messages to make sure that scores
are being read, calculated and stored successfully

## License
The source found in this repository can be used under the open source
[MIT License][1].

[1]:./LICENSE
[2]:https://nodejs.org/en/
[3]:https://aws.amazon.com/cli/
