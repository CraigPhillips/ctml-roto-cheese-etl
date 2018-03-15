const { League } = require('./yahoo/fantasy-baseball-league');

process.env.FE_CHEESE_YAHOO_USER = 'craigphillipsmissinggoogle';
process.env.FE_CHEESE_YAHOO_PASS = 'Nn#KN4xHJ*b8fwUdUQz*DhiF8';

(async () => {
  let league;
  try {
    league = new League('chickentendermelt');
    const currentScores = await league.getCurrentWeeklyScores();
  } catch(testingError) {
    console.error(testingError);
  } finally {
    if (league) await league.dispose();
  }
})();
