import fs from 'fs';
import util from 'util';

import beThere from 'be-there.js';

const cfStatusesSuccess = {
  CREATE_COMPLETE: true,
  DELETE_COMPLETE: true,
  UPDATE_COMPLETE: true,
};
const cfStatusesFailure = {
  CREATE_FAILED: true,
  DELETE_FAILED: true,
  ROLLBACK_COMPLETE: true,
  ROLLBACK_FAILED: true,
  UPDATE_ROLLBACK_COMPLETE: true,
  UPDATE_ROLLBACK_FAILED: true,
};
const waitMs = 5000;

async function waitOnStackTransition(cfClient, StackName, log) {
  beThere({ cfClient, StackName });

  /* eslint-disable no-await-in-loop */
  /*
    The point of this loop is to wait for each of the async calls to finish and
    report the correct status on the stack. Those calls can not be processed in
    parallel.
  */
  let StackStatus = '';
  while (!cfStatusesSuccess[StackStatus]) {
    if (StackStatus) await new Promise(resolve => setTimeout(resolve, waitMs));
    const [stack] = (await cfClient.describeStacks({ StackName }).promise())
      .Stacks;
    if (!stack) throw new Error(`stack ${StackName} is missing`);
    ({ StackStatus } = stack);

    if (cfStatusesFailure[StackStatus]) {
      throw new Error(`stack ${StackName} in failed state: ${StackStatus}`);
    } else if (!cfStatusesSuccess[StackStatus]) {
      log.info(`stack ${StackName} still updating (${StackStatus})`);
    }
  }
  /* eslint-enaable no-await-in-loop */

  log.info(`stack ${StackName} change completed (${StackStatus})`);
}

export default async function deployCFStack(
  config,
  cfClient,
  depProps,
  srcProps,
  log,
) {
  beThere({ cfClient, config, depProps, srcProps });
  const StackName = config.deployment.cfStackName;

  const request = { StackName };
  let stack;
  try {
    log.info('checking CloudFormation stack status', { StackName });
    [stack] = (await cfClient.describeStacks({ StackName }).promise()).Stacks;
  } catch (error) {
    if (!error.message.endsWith('does not exist')) throw error;
  }

  Object.assign(request, {
    Capabilities: ['CAPABILITY_IAM'],
    Parameters: Object.entries({
      DependenciesHash: depProps.hash,
      DependenciesS3Bucket: depProps.Bucket,
      DependenciesS3Key: depProps.Key,
      ErrorScreenshotS3Path: config.errorScreenshotStorage.location,
      LeagueUrl: config.leagueUrl,
      PublishS3Bucket: config.dataPublishing.s3Bucket,
      PublishS3Path: config.dataPublishing.s3Path,
      RunAsUser: config.runAs.user,
      RunAsPassword: config.runAs.password,
      SrcHash: srcProps.hash,
      SrcS3Bucket: srcProps.Bucket,
      SrcS3Key: srcProps.Key,
    }).map(([k, v]) => ({ ParameterKey: k, ParameterValue: v })),
    TemplateBody:
      (await util.promisify(fs.readFile)(config.deployment.cfTemplate))
        .toString(),
  });

  if (stack) {
    try {
      await cfClient.updateStack(request).promise();
      log.info('stack found, update started', { StackName });
      await waitOnStackTransition(cfClient, StackName, log);
    } catch (error) {
      if (error.message !== 'No updates are to be performed.') throw error;
      log.info('no updates to stack required', { StackName });
    }
  } else {
    log.info('stack not found, creation started', { StackName });
    await cfClient.createStack(request).promise();
    await waitOnStackTransition(cfClient, StackName, log);
  }
}
