import AWS from 'aws-sdk';
import puppeteer from 'puppeteer';

import Config from './config.js';
import ErrorHandler from './error-handler.js';
import ETL from './etl.js';
import LeagueBrowser from './league-browser.js';
import Log from './log.js';
import Metrics from './metrics.js';
import ResultsPublisher from './results-publisher.js';

(async function runEtl() {
  let etl;
  let log;
  try {
    log = new Log({ prettyPrintJSON: true });

    const cloudWatch = new AWS.CloudWatch();
    const etlConfig = new Config();
    const metrics = new Metrics(cloudWatch);
    const s3 = new AWS.S3();

    const leagueBrowser = new LeagueBrowser(
      etlConfig.leagueUrl,
      etlConfig.runAs.user,
      etlConfig.runAs.password,
      await puppeteer.launch({ args: ['--no-sandbox'] }),
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

    etl = new ETL(leagueBrowser, resultsPublisher, log);
    await etl.run();
  } catch (error) {
    (log || console).error('failed ETL run', { error });
  } finally { await etl.dispose(); }
}());
