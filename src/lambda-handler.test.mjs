import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import ETL from './etl';
import Log from './log';
import { dependencies, LambdaHandler, handle } from './lambda-handler';
import NoOpLog from '../test/no-op-log';

chai.should();
chai.use(chaiAsPromised);

describe('LambdaHandler', () => {
  let defaultEtlFactory;
  let defaultLogFactory;
  let log;
  let stubs;

  let mockEtl;
  beforeEach(() => {
    defaultEtlFactory = dependencies.etlFactory;
    defaultLogFactory = dependencies.logFactory;

    log = new NoOpLog();
    mockEtl = new ETL({}, {}, {});

    stubs = {
      browserLaunch: sinon
        .stub(dependencies.webBrowserLauncher, 'launch')
        .returns(Promise.resolve({})),
      dispose: sinon
        .stub(mockEtl, 'dispose')
        .returns(Promise.resolve()),
      run: sinon
        .stub(mockEtl, 'run')
        .returns(Promise.resolve()),
    };

    dependencies.etlFactory = async () => mockEtl;
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
      log.debugs.length.should.equal(3);
      log.debugs[0].should.match(/^initializing.*/);
      log.debugs[1].should.match(/^starting.*/);
      log.debugs[2].should.match(/.*complete$/);
      sinon.assert.called(stubs.run);
      sinon.assert.called(stubs.dispose);
    });

    it('should fail on ETL initiatialization failure', async () => {
      dependencies.etlFactory = async () => { throw new Error('fake error'); };

      await handle().should.be.rejectedWith('fake error');
      log.errors.length.should.equal(1);
      log.errors[0][0].should.match(/^ETL run failed.*/);
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
      sinon.assert.called(stubs.dispose);
    });
  });
});
