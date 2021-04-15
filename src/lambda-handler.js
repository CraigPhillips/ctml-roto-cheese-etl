import AWS from 'aws-sdk';
import chromium from 'chrome-aws-lambda';
import privacy from 'private-parts';
import puppeteer from 'puppeteer';

import Config from './config.js';
import ErrorHandler from './error-handler.js';
import ETL from './etl.js';
import LeagueBrowser from './league-browser.js';
import Log from './log.js';
import Metrics from './metrics.js';
import ResultsPublisher from './results-publisher.js';


// want to allow ETL run anytime between 5 PM and 1 AM Pacific time which
// translates to midnight to 8 AM UTC
const startEtlHours = 0;
const endEtlHours = 8;

// additionally, allow ETLs to run earlier in the day on weekends since there
// are regular weekend games
const startEtlHoursWeekend = 18;

const saturday = 6;
const sunday = 0;

export const dependencies = {
  clock: { getCurrentDate: () => new Date() },
  etlFactory: async (metrics, webBrowserLauncher, log) => {
    const etlConfig = new Config();
    const s3 = new AWS.S3();

    const leagueBrowser = new LeagueBrowser(
      etlConfig.leagueUrl,
      etlConfig.runAs.user,
      etlConfig.runAs.password,
      await webBrowserLauncher.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      }),
      log,
      metrics,
      new ErrorHandler(etlConfig, log, s3),
    );
    const resultsPublisher = new ResultsPublisher(
      etlConfig.dataPublishing.s3Bucket,
      etlConfig.dataPublishing.s3Path,
      s3,
      log,
    );

    return new ETL(leagueBrowser, resultsPublisher, log);
  },
  metricsFactory: () => new Metrics(new AWS.CloudWatch()),
  logFactory: () => new Log(),
  webBrowserLauncher: puppeteer,
};

function duringScheduledRunTime(log) {
  const now = dependencies.clock.getCurrentDate();
  log.debug('current time listing', { now });
  const nowHours = now.getUTCHours();

  if (startEtlHours <= nowHours && nowHours < endEtlHours) {
    return true;
  }

  const day = now.getUTCDay();
  if ((day == saturday || day == sunday) && startEtlHoursWeekend <= nowHours) {
    return true;
  }

  log.debug('skipping ETL outside of target hours', {
    time: now.toISOString(),
  });
  return false;
}

let _;
export class LambdaHandler {
  constructor({
    etlFactory,
    metricsFactory,
    webBrowserLauncher,
    logFactory,
   } = {}) {
    if (!_) _ = privacy.createKey();

    Object.assign(_(this), {
      etlFactory,
      logFactory,
      metricsFactory,
      webBrowserLauncher,
    });
    if (!etlFactory || !webBrowserLauncher || !logFactory) {
      throw new Error('all parameters are required');
    }
  }

  async handle() {
    const log = _(this).logFactory();
    const { webBrowserLauncher } = _(this);

    let etl;
    try {
      const metrics = _(this).metricsFactory();
      await metrics.recordSuccessCount(false);

      if (duringScheduledRunTime(log)) {
        log.debug('initializing ETL');
        etl = await _(this).etlFactory(metrics, webBrowserLauncher, log);
        log.debug('starting ETL run');
        await etl.run();
        log.debug('ETL run complete');
      }
      await metrics.recordSuccessCount();
    } catch (error) {
      log.error('ETL run failed', { error });
      throw error;
    } finally { if (etl) await etl.dispose(); }
  }
}

export async function handle() {
  await (new LambdaHandler(dependencies)).handle();
}
