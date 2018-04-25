const { League } = require('./yahoo/fantasy-baseball-league');
const { S3Publisher } = require('./aws/s3-publisher');
const { WeeklyRotoScore } = require('./scoring/weekly-roto.js');

process.env.FE_CHEESE_YAHOO_USER = 'craigphillipsmissinggoogle';
process.env.FE_CHEESE_YAHOO_PASS = 'I%T_tm1V!^mVN=e!+H6p@CAqs';
process.env.FE_CHEESE_PUB_PREFIX = 'data';
process.env.FE_CHEESE_PUB_BUCKET = 'cheese.frozenexports.net';

const run = (async () => {
  console.time('ctml data updated');
  console.log(`starting update at ${(new Date()).toString()}`);
  let league;
  try {
    league = new League('chickentendermelt');
    const s3Publisher = new S3Publisher();

    let currentScores;
    try {
      currentScores = await league.getCurrentWeeklyScores({
        categories: '.RedZone > table > thead > tr > *',
        scores: '.RedZone > table > tbody > tr > *',
      });
    }
    catch(error) {
      console.error('encountered error with default lookup fields:');
      console.error(error);
      console.log('trying again...');
      currentScores = await league.getCurrentWeeklyScores();
    }

    const teams = await league.getTeams();
    const rotoScores = new WeeklyRotoScore(currentScores);

    console.log(await s3Publisher.write(rotoScores, teams));
  } catch(testingError) {
    console.error('error in test run', testingError);
  } finally {
    try { if (league) await league.dispose(); }
    catch(disposeError) {
      console.error('error in league shut down', disposeError);
    }
  }

  console.log(`finished update at ${(new Date()).toString()}`);
  console.timeEnd('ctml data updated');
});

run();
const interval = setInterval(() => {
  run();
  // clearInterval(interval);
}, 15 * 60 * 1000);
