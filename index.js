const { League } = require('./yahoo/fantasy-baseball-league');

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
