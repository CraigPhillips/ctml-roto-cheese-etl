const { League } = require('./yahoo/fantasy-baseball-league');

process.env.FE_CHEESE_YAHOO_USER = '';
process.env.FE_CHEESE_YAHOO_PASS = '';

(async () => {
  let league;
  try {
    league = new League('chickentendermelt');
    const currentScores = await league.getCurrentWeeklyScores();
    console.log(currentScores);
  } catch(testingError) {
    console.error(testingError);
  } finally {
    if (league) await league.dispose();
  }
})();
