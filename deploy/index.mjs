import CloudFormation from 'aws-sdk/clients/cloudformation';
import S3 from 'aws-sdk/clients/s3';

import Config from '../src/config';
import deployCFStack from './deploy-cf-stack';
import Log from '../src/log';
import publishSrc from './publish-src';
import publishDependencies from './publish-dependencies';

(async function deploy() {
  let log;
  try {
    log = new Log({ formatForCLIs: true });
    const config = new Config();
    const s3Client = new S3();
    const depProps = await publishDependencies(config, s3Client, log);
    const srcProps = await publishSrc(config, s3Client, log);

    const cfClient = new CloudFormation();
    await deployCFStack(config, cfClient, depProps, srcProps, log);
  } catch (deployError) {
    (log || console).error('deployment failed', deployError);
  }
}());
