import cats from './scoring-categories.js';

export default function addRotoScores(rawScores, currentWeek, log) {
  log.debug('precalculating roto scores', { currentWeek, rawScores });
  const clonedScores = JSON.parse(JSON.stringify(rawScores));

  log.debug('storing category roto scores');
  Object.keys(clonedScores).forEach((teamId) => {
    const team = clonedScores[teamId];
    team.total = Object.keys(clonedScores).length;

    Object.keys(cats).filter(cat => team[cat]).forEach((cat) => {
      team[cat] = Object.assign(team[cat], {
        rank: 1,
        rotoScore: 1,
        thisTieCount: 1,
      });
      Object.entries(clonedScores).forEach(([compId, compT]) => {
        if (teamId !== compId) {
          const score = team[cat].rawScore;
          const comp = compT[cat].rawScore;
          if (score === comp) {
            team.total += 0.5;
            team[cat].rotoScore += 0.5;
            team[cat].thisTieCount += 1;
          } else if (
            (cats[cat].biggerIsBetter && score > comp)
            || (!cats[cat].biggerIsBetter && score < comp)
          ) {
            team.total += 1;
            team[cat].rotoScore += 1;
          } else {
            team[cat].rank += 1;
          }
        }
      });
    });
  });

  log.debug('storing overall roto scores');
  Object.keys(clonedScores).forEach((teamId) => {
    const team = clonedScores[teamId];
    Object.entries(clonedScores).forEach(([compId, compT]) => {
      if (teamId !== compId) {
        team.tieCount += team.total === compT.total ? 1 : 0;
        team.rank += team.total < compT.total ? 1 : 0;
      }
    });
  });
  clonedScores.timestamp = (new Date()).toUTCString();
  clonedScores.weekNumber = currentWeek;

  log.debug('scores appended', { currentWeek, rawScores });
  return clonedScores;
}
