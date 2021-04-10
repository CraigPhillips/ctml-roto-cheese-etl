import AWS from 'aws-sdk';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { dependencies, LambdaHandler, handle } from './lambda-handler.mjs';
import ETL from './etl.mjs';
import Log from './log.mjs';
import Metrics from './metrics.mjs';
import NoOpLog from '../test/no-op-log.mjs';

chai.should();
chai.use(chaiAsPromised);

describe('LambdaHandler', () => {
  let cloudWatch;
  let defaultClock;
  let defaultEtlFactory;
  let defaultLogFactory;
  let log;
  let metrics;
  let stubs;

  let mockClock;
  let mockEtl;
  beforeEach(() => {
    defaultClock = dependencies.clock;
    defaultEtlFactory = dependencies.etlFactory;
    defaultLogFactory = dependencies.logFactory;

    cloudWatch = new AWS.CloudWatch();
    log = new NoOpLog();
    mockClock = {
      getCurrentDate: () => new Date('Fri, 09 Apr 2021 00:00:01 GMT'),
    };
    mockEtl = new ETL({}, {}, {});
    metrics = new Metrics(cloudWatch);

    stubs = {
      browserLaunch: sinon
        .stub(dependencies.webBrowserLauncher, 'launch')
        .returns(Promise.resolve({})),
      dispose: sinon
        .stub(mockEtl, 'dispose')
        .returns(Promise.resolve()),
      putMetricData: sinon
        .stub(cloudWatch, 'putMetricData')
        .returns({ promise: () => Promise.resolve() }),
      run: sinon
        .stub(mockEtl, 'run')
        .returns(Promise.resolve()),
    };

    dependencies.clock = mockClock;
    dependencies.etlFactory = async () => mockEtl;
    dependencies.metricsFactory = () => metrics;
    dependencies.logFactory = () => log;
  });

  afterEach(() => {
    sinon.restore();
    dependencies.etlFactory = defaultEtlFactory;
    dependencies.logFactory = defaultLogFactory;
  });

  describe('constructor', () => {
    it('should fail with missing parameters', () => {
      /* eslint-disable no-new */
      (function missingEtlFactory() {
        new LambdaHandler();
      }).should.throw(Error);
      (function missingBrowserLauncher() {
        new LambdaHandler({});
      }).should.throw(Error);
      (function missingLogFactory() {
        new LambdaHandler({}, {});
      }).should.throw(Error);
      /* eslint-enable no-new */
    });
  });

  describe('default dependency factories', () => {
    it('should generate dependencies', async () => {
      const builtEtl = await defaultEtlFactory(
        dependencies.metrics,
        dependencies.webBrowserLauncher,
        log,
      );
      const builtLog = defaultLogFactory();

      Object.getPrototypeOf(builtEtl).should.equal(ETL.prototype);
      Object.getPrototypeOf(builtLog).should.equal(Log.prototype);
    });
  });

  describe('handle', () => {
    it('should run ETL', async () => {
      await handle();

      log.errors.length.should.equal(0);
      log.debugs.length.should.equal(4);
      log.debugs[0].should.match(/^current time.*/);
      log.debugs[1].should.match(/^initializing.*/);
      log.debugs[2].should.match(/^starting.*/);
      log.debugs[3].should.match(/.*complete$/);
      sinon.assert.calledTwice(stubs.putMetricData);
      sinon.assert.called(stubs.run);
      sinon.assert.called(stubs.dispose);
    });

    it('should fail on ETL initiatialization failure', async () => {
      dependencies.etlFactory = async () => { throw new Error('fake error'); };

      await handle().should.be.rejectedWith('fake error');
      log.errors.length.should.equal(1);
      log.errors[0][0].should.match(/^ETL run failed.*/);
      sinon.assert.calledOnce(stubs.putMetricData);
      sinon.assert.notCalled(stubs.dispose);
    });

    it('should fail on ETL error', async () => {
      stubs.run.restore();
      stubs.run = sinon
        .stub(mockEtl, 'run')
        .throws(new Error('fake Lambda handler error'));

      await handle().should.be.rejectedWith('fake Lambda handler error');
      log.errors.length.should.equal(1);
      log.errors[0][0].should.match(/^ETL run failed.*/);
      sinon.assert.calledOnce(stubs.putMetricData);
      sinon.assert.called(stubs.dispose);
    });
  });
});
