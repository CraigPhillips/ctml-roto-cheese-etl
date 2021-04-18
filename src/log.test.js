import chai from 'chai';
import sinon from 'sinon';

import Log, { service } from './log.js';

const should = chai.should();

describe('Log', () => {
  const f = () => {};
  const fakes = {
    cli: { formatType: 'cli' },
    console: { transportType: 'conosle' },
    combinedFormat: {},
    errors: { formatType: 'error' },
    json: { formatType: 'json' },
    prettyPrint: { formatType: 'prettyPrint' },
    timestamp: { formatType: 'timestamp' },
  };
  const logger = { debug: f, error: f, info: f, warn: f };
  const winston = {
    createLogger: f,
    format: {
      cli: f,
      combine: f,
      errors: f,
      json: f,
      prettyPrint: f,
      timestamp: f,
    },
    transports: { Console: f },
  };
  let stubs;

  beforeEach(() => {
    stubs = {
      cli: sinon.stub(winston.format, 'cli').returns(fakes.cli),
      combine: sinon
        .stub(winston.format, 'combine')
        .returns(fakes.combinedFormat),
      console: sinon.stub(winston.transports, 'Console').returns(fakes.console),
      createLogger: sinon.stub(winston, 'createLogger').returns(logger),
      debug: sinon.stub(logger, 'debug'),
      error: sinon.stub(logger, 'error'),
      errors: sinon.stub(winston.format, 'errors').returns(fakes.errors),
      info: sinon.stub(logger, 'info'),
      json: sinon.stub(winston.format, 'json').returns(fakes.json),
      prettyPrint: sinon
        .stub(winston.format, 'prettyPrint')
        .returns(fakes.prettyPrint),
      timestamp: sinon
        .stub(winston.format, 'timestamp')
        .returns(fakes.timestamp),
      warn: sinon.stub(logger, 'warn'),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should work with default values winston implementation', () => {
      const log = new Log();
      should.exist(log);
    });

    it('should create and configure log with default setting', () => {
      const log = new Log({ winston });

      should.exist(log);
      sinon.assert.calledWith(stubs.errors, { stack: true });
      sinon.assert.calledWith(
        stubs.combine,
        fakes.json,
        fakes.timestamp,
        fakes.errors,
      );
      sinon.assert.calledWith(stubs.console, { level: 'debug' });
      sinon.assert.calledWith(stubs.createLogger, {
        level: 'debug',
        format: fakes.combinedFormat,
        defaultMeta: { service },
        transports: [fakes.console],
      });
    });

    it('should enable pretty print for JSON if configured', () => {
      const log = new Log({ prettyPrintJSON: true, winston });

      should.exist(log);
      sinon.assert.calledWith(stubs.errors, { stack: true });
      sinon.assert.calledWith(
        stubs.combine,
        fakes.json,
        fakes.timestamp,
        fakes.errors,
        fakes.prettyPrint,
      );
      sinon.assert.calledWith(stubs.console, { level: 'debug' });
      sinon.assert.calledWith(stubs.createLogger, {
        level: 'debug',
        format: fakes.combinedFormat,
        defaultMeta: { service },
        transports: [fakes.console],
      });
    });

    it('should use simple formatting for CLI usage', () => {
      const log = new Log({ formatForCLIs: true, winston });

      should.exist(log);
      sinon.assert.calledWith(stubs.console, { level: 'debug' });
      sinon.assert.calledWith(stubs.createLogger, {
        level: 'debug',
        format: fakes.cli,
        defaultMeta: { service },
        transports: [fakes.console],
      });
    });
  });

  describe('logging methods', () => {
    it('should trigger undlying logging methods', () => {
      const log = new Log({ winston });
      log.debug('debug msg', { msgType: 'debug' });
      log.error('error msg', { msgType: 'error' });
      log.info('info msg', { msgType: 'info' });
      log.warn('warn msg', { msgType: 'warn' });

      sinon.assert.calledWith(stubs.debug, 'debug msg', { msgType: 'debug' });
      sinon.assert.calledWith(stubs.error, 'error msg', { msgType: 'error' });
      sinon.assert.calledWith(stubs.info, 'info msg', { msgType: 'info' });
      sinon.assert.calledWith(stubs.warn, 'warn msg', { msgType: 'warn' });
    });
  });
});
