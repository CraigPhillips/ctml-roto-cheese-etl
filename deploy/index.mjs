import AWS from 'aws-sdk';

import Config from '../src/config.mjs';
import deployCFStack from './deploy-cf-stack.mjs';
import Log from '../src/log.mjs';
import publishSrc from './publish-src.mjs';
import publishDependencies from './publish-dependencies.mjs';

(async function deploy() {
  let log;
  try {
    log = new Log({ formatForCLIs: true });
    const config = new Config();
    const s3Client = new AWS.S3();
    const depProps = await publishDependencies(config, s3Client, log);
    const srcProps = await publishSrc(config, s3Client, log);

    const cfClient = new AWS.CloudFormation();
    await deployCFStack(config, cfClient, depProps, srcProps, log);
  } catch (deployError) {
    (log || console).error('deployment failed', deployError);
  }
}());
