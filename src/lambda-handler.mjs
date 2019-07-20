import chromium from 'chrome-aws-lambda';
import privacy from 'private-parts';
import S3 from 'aws-sdk/clients/s3';
import puppeteer from 'puppeteer';

import Config from './config';
import ErrorHandler from './error-handler';
import ETL from './etl';
import LeagueBrowser from './league-browser';
import Log from './log';
import ResultsPublisher from './results-publisher';

export const dependencies = {
  etlFactory: async (webBrowserLauncher, log) => {
    const etlConfig = new Config();
    const s3 = new S3();

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
  logFactory: () => new Log(),
  webBrowserLauncher: puppeteer,
};

let _;
export class LambdaHandler {
  constructor({ etlFactory, webBrowserLauncher, logFactory } = {}) {
    if (!_) _ = privacy.createKey();

    Object.assign(_(this), {
      etlFactory,
      logFactory,
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
      log.debug('initializing ETL');
      etl = await _(this).etlFactory(webBrowserLauncher, log);
      log.debug('starting ETL run');
      await etl.run();
      log.debug('ETL run complete');
    } catch (error) {
      log.error('ETL run failed', { error });
      throw error;
    } finally { if (etl) await etl.dispose(); }
  }
}

export async function handle() {
  await (new LambdaHandler(dependencies)).handle();
}
