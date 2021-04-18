import chai from 'chai';

import Config from './config.js';

const should = chai.should();

function setEnvs(target) {
  const definedEnvs = {};
  Object.entries(target).forEach(([property, value]) => {
    if (typeof value === 'object') {
      Object.assign(definedEnvs, setEnvs(value));
    } else {
      definedEnvs[value] = property;
      process.env[value] = property;
    }
  });
  return definedEnvs;
}

function checkConfig(target, config) {
  Object.entries(target).forEach(([property, value]) => {
    should.exist(config[property], `checking ${property}`);
    if (typeof value === 'object') {
      config[property].should.be.a('object');
      checkConfig(value, config[property]);
    } else {
      config[property].should.equal(property);
    }
  });
}

describe('Config', () => {
  let definedEnvs;

  const targetConfig = {
    chromeBinaryPath: 'CHROME_BINARY_PATH',
    dataPublishing: {
      s3Bucket: 'PUBLISH_S3_BUCKET',
      s3Path: 'PUBLISH_S3_PATH',
    },
    deployment: {
      cfStackName: 'DEPLOY_CF_STACK_NAME',
      cfTemplate: 'DEPLOY_CF_TEMPLATE',
      notificationsEmail: 'NOTIFICATIONS_EMAIL',
      s3Bucket: 'DEPLOY_S3_BUCKET',
      s3DependenciesPath: 'DEPLOY_DEPENDENCIES_S3_PATH',
      s3SrcPath: 'DEPLOY_SRC_S3_PATH',
    },
    errorScreenshotStorage: {
      location: 'ERROR_SCREENSHOT_STORAGE_LOCATION',
      s3Bucket: 'ERROR_SCREENSHOT_S3_BUCKET',
      type: 'ERROR_SCREENSHOT_STORAGE_TYPE',
    },
    leagueUrl: 'LEAGUE_URL',
    runAs: {
      password: 'RUN_AS_PASSWORD',
      user: 'RUN_AS_USER',
    },
  };

  beforeEach(() => {
    definedEnvs = setEnvs(targetConfig);
  });

  it('should read all properties from envs', () => {
    checkConfig(targetConfig, new Config());
  });

  afterEach(() => {
    Object.entries(definedEnvs).forEach(([env, originalValue]) => {
      process.env[env] = originalValue;
    });
  });
});
