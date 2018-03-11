const { League } = require('./yahoo/fantasy-baseball-league');

(async () => {
  let league;
  try {
    console.log(1);
    league = new League('chickentendermelt');
    console.log(2);
    const currentScores = await league.getCurrentWeeklyScores();
    console.log(3);
  } catch(testingError) {
    console.log(4);
    console.error(testingError);
  } finally {
    console.log(5);
    if (league) await league.dispose();
  }
})();
