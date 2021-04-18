import chai from 'chai';

import addRotoScores from './add-roto-scores.js';
import cats from './scoring-categories.js';
import NoOpLog from '../test/no-op-log.js';

chai.should();

describe('addRotoScores', () => {
  const highValue = 500;
  const teamCount = 10;
  const week = 1;

  let log;
  let pointsPerCategory = 0;
  let scores;

  for (let i = 1; i <= teamCount; i += 1) pointsPerCategory += i;

  beforeEach(() => {
    function buildEmptyScores() {
      const emptyScores = {};
      Object.entries(cats).forEach(([cat, { biggerIsBetter }]) => {
        emptyScores[cat] = { rawScore: biggerIsBetter ? 0 : highValue };
      });
      return emptyScores;
    }

    scores = {};
    for (let i = 1; i <= teamCount; i += 1) {
      scores[i.toString()] = {
        rank: 1,
        tieCount: 1,
        total: 0,
      };
      Object.assign(scores[i.toString()], buildEmptyScores());
    }

    log = new NoOpLog();
  });

  it('should mark all teams equal with default scores', () => {
    const startTime = new Date();
    const result = addRotoScores(scores, week, log);

    Object
      .entries(result)
      .filter(([key]) => key !== 'timestamp' && key !== 'weekNumber')
      .forEach(([, teamScore]) => {
        teamScore.rank.should.equal(1);
        teamScore.tieCount.should.equal(teamCount);
        teamScore.total.should.equal(pointsPerCategory);

        Object.entries(cats).forEach(([cat, { biggerIsBetter }]) => {
          teamScore[cat].rawScore.should.equal(biggerIsBetter ? 0 : highValue);
          teamScore[cat].rank.should.equal(1);
          teamScore[cat].rotoScore.should.equal(pointsPerCategory / teamCount);
          teamScore[cat].thisTieCount.should.equal(teamCount);
        });
      });

    const timestamp = new Date(result.timestamp);
    timestamp.should.be.a('Date');
    startTime.should.be.greaterThan(timestamp);
    result.weekNumber.should.equal(week);
  });

  it('should mark two teams tied if ahead in different category types', () => {
    scores['1'].r.rawScore = 1;
    scores['2'].era.rawScore = 0.01;

    const result = addRotoScores(scores, week, log);

    Object
      .entries(result)
      .filter(([key]) => key !== 'timestamp' && key !== 'weekNumber')
      .forEach(([teamId, teamScore]) => {
        const isLeadingTeam = teamId === '1' || teamId === '2';
        teamScore.rank.should.equal(isLeadingTeam ? 1 : 3);
        teamScore.tieCount.should.equal(isLeadingTeam ? 2 : teamCount - 2);
        teamScore.total.should.equal(isLeadingTeam ? 59 : 54);
      });
  });
});
