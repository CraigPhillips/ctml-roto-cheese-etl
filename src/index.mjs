import AWS from 'aws-sdk';
import puppeteer from 'puppeteer';

import Config from './config.mjs';
import ErrorHandler from './error-handler.mjs';
import ETL from './etl.mjs';
import LeagueBrowser from './league-browser.mjs';
import Log from './log.mjs';
import Metrics from './metrics.mjs';
import ResultsPublisher from './results-publisher.mjs';

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
