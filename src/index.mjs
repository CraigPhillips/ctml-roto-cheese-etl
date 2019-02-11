import S3 from 'aws-sdk/clients/s3';
import puppeteer from 'puppeteer';

import Config from './config';
import ErrorHandler from './error-handler';
import ETL from './etl';
import LeagueBrowser from './league-browser';
import Log from './log';
import ResultsPublisher from './results-publisher';

(async function runEtl() {
  let etl;
  let log;
  try {
    log = new Log({ prettyPrintJSON: true });
    const etlConfig = new Config();
    const s3 = new S3();

    const leagueBrowser = new LeagueBrowser(
      etlConfig.leagueUrl,
      etlConfig.runAs.user,
      etlConfig.runAs.password,
      await puppeteer.launch({ args: ['--no-sandbox'] }),
      log,
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
