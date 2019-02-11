// import beThere from 'be-there.js';

export default class Config {
  constructor() {
    // beThere({ process, 'process.env': process.env });

    Object.assign(this, {
      chromeBinaryPath: process.env.CHROME_BINARY_PATH,
      dataPublishing: {
        s3Bucket: process.env.PUBLISH_S3_BUCKET,
        s3Path: process.env.PUBLISH_S3_PATH,
      },
      deployment: {
        cfStackName: process.env.DEPLOY_CF_STACK_NAME,
        cfTemplate: process.env.DEPLOY_CF_TEMPLATE,
        s3Bucket: process.env.DEPLOY_S3_BUCKET,
        s3DependenciesPath: process.env.DEPLOY_DEPENDENCIES_S3_PATH,
        s3SrcPath: process.env.DEPLOY_SRC_S3_PATH,
      },
      errorScreenshotStorage: {
        location: process.env.ERROR_SCREENSHOT_STORAGE_LOCATION,
        s3Bucket: process.env.ERROR_SCREENSHOT_S3_BUCKET,
        type: process.env.ERROR_SCREENSHOT_STORAGE_TYPE,
      },
      leagueUrl: process.env.LEAGUE_URL,
      runAs: {
        password: process.env.RUN_AS_PASSWORD,
        user: process.env.RUN_AS_USER,
      },
    });
  }
}
