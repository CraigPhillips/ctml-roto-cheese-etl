import chai from 'chai';
import sinon from 'sinon';
import AWS from 'aws-sdk';

import ErrorHandler from './error-handler.js';
import NoOpLog from '../test/no-op-log.js';

chai.should();

describe('ErrorHandler', () => {
  let log;
  const page = { screenshot: () => {} };
  let screenshotStub;

  beforeEach(() => {
    log = new NoOpLog();
    screenshotStub = sinon
      .stub(page, 'screenshot')
      .returns(new Promise((resolve) => { resolve('fake content'); }));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should log default error debug message', async () => {
    const handler = new ErrorHandler({}, log);
    await handler.handle();
    log.debugs.length.should.equal(1);
    log.debugs[0][1].error.message.should.include('no error');
  });

  it('should log error for missing screenshot storage type', async () => {
    const handler = new ErrorHandler({}, log);
    await handler.handle(new Error('fake error'), page);
    log.errors.length.should.equal(1);
    log.errors[0][0].should.include('bad error screenshot storage type');
  });

  it('should log error with missing page object', async () => {
    const handler = new ErrorHandler({}, log);
    await handler.handle(new Error('fake error'));
    log.errors.length.should.equal(1);
    log.errors[0][0].should.include('no page object');
  });

  describe('handle with local screenshot storage', () => {
    let localConfig;
    beforeEach(() => {
      localConfig = {
        errorScreenshotStorage: {
          location: './',
          type: 'local',
        },
      };
    });

    it('should save screenshot locally', async () => {
      const handler = new ErrorHandler(localConfig, log);

      await handler.handle(new Error('fake error'), page);

      sinon.assert.calledWith(screenshotStub, {
        fullPage: true,
        path: sinon.match(/^\.\/.*\.png/),
      });
      log.errors.length.should.equal(0);
    });

    it('should save screenshot locally with default path', async () => {
      localConfig.errorScreenshotStorage.location = undefined;
      const handler = new ErrorHandler(localConfig, log);

      await handler.handle(new Error('fake error'), page);

      sinon.assert.calledWith(screenshotStub, {
        fullPage: true,
        path: sinon.match(/^\.\/.*\.png/),
      });
      log.errors.length.should.equal(0);
    });

    it('should log error for screenshot save error', async () => {
      screenshotStub.restore();
      screenshotStub = sinon
        .stub(page, 'screenshot')
        .throws(new Error('fake error'));
      const handler = new ErrorHandler(localConfig, log);

      await handler.handle(new Error('fake error'), page);

      log.errors.length.should.equal(1);
      log.errors[0][0].should.include('failed to save screenshot');
    });
  });

  describe('handle with S3 screenshot storage', () => {
    let putStub;
    const s3 = new AWS.S3();
    let s3Config;
    beforeEach(() => {
      putStub = sinon
        .stub(s3, 'putObject')
        .returns({ promise: () => new Promise((resolve) => { resolve(); }) });
      s3Config = {
        errorScreenshotStorage: {
          s3Bucket: 'fake bucket',
          location: 'fake path',
          type: 's3',
        },
      };
    });

    it('should send screenshot to S3', async () => {
      const handler = new ErrorHandler(s3Config, log, s3);

      await handler.handle(new Error('fake error'), page);

      sinon.assert.calledWith(screenshotStub, { fullPage: true });
      sinon.assert.calledWith(putStub, {
        Body: 'fake content',
        Bucket: 'fake bucket',
        Key: sinon.match(/^fake path\/.*\.png$/),
      });
      log.errors.length.should.equal(0);
    });

    it('should send screenshot to S3 default path', async () => {
      s3Config.errorScreenshotStorage.location = undefined;
      const handler = new ErrorHandler(s3Config, log, s3);

      await handler.handle(new Error('fake error'), page);

      sinon.assert.calledWith(putStub, {
        Body: 'fake content',
        Bucket: 'fake bucket',
        Key: sinon.match(/^[0-9].*\.png$/),
      });
    });

    it('should log error for missing S3 bucket setting', async () => {
      s3Config.errorScreenshotStorage.s3Bucket = undefined;
      const handler = new ErrorHandler(s3Config, log, s3);

      await handler.handle(new Error('fake error'), page);

      log.errors.length.should.equal(1);
      log.errors[0][0].should.include('no S3 bucket');
      sinon.assert.notCalled(screenshotStub);
      sinon.assert.notCalled(putStub);
    });

    it('should log error for screenshot save error', async () => {
      screenshotStub.restore();
      screenshotStub = sinon
        .stub(page, 'screenshot')
        .throws(new Error('fake error'));
      const handler = new ErrorHandler(s3Config, log, s3);

      await handler.handle(new Error('fake error'), page);

      log.errors.length.should.equal(1);
      log.errors[0][0].should.include('failed to save screenshot');
      sinon.assert.notCalled(putStub);
    });
  });
});
