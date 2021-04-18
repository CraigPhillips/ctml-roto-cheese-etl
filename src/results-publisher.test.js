import chai from 'chai';
import sinon from 'sinon';

import NoOpLog from '../test/no-op-log.js';
import ResultsPublisher from './results-publisher.js';

chai.should();

describe('ResultsPublisher', () => {
  const bucket = 'bucket';
  const log = new NoOpLog();
  const path = 'path';
  const s3 = { putObject: () => {} };
  const teamData = { prop: 'team value' };
  const weeklyData = { prop: 'weekly value', weekNumber: 1 };

  let stubs;

  beforeEach(() => {
    stubs = {
      putObject: sinon.stub(s3, 'putObject').returns({
        promise: () => Promise.resolve(),
      }),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('publishTeamData', () => {
    it('should trigger publishing of team data', async () => {
      const publisher = new ResultsPublisher(bucket, path, s3, log);

      await publisher.publishTeamData(teamData);

      sinon.assert.calledWith(stubs.putObject, {
        Body: JSON.stringify(teamData),
        Bucket: bucket,
        Key: `${path}/teams.json`,
      });
    });

    it('should trigger publishing with path ending in /', async () => {
      const publisher = new ResultsPublisher(bucket, `${path}/`, s3, log);

      await publisher.publishTeamData(teamData);

      sinon.assert.calledWith(stubs.putObject, {
        Body: JSON.stringify(teamData),
        Bucket: bucket,
        Key: `${path}/teams.json`,
      });
    });
  });

  describe('publishWeeklyRotoData', async () => {
    it('should trigger publishing of weekly data', async () => {
      const publisher = new ResultsPublisher(bucket, path, s3, log);

      await publisher.publishWeeklyRotoData(weeklyData);

      sinon.assert.calledWith(stubs.putObject, {
        Body: JSON.stringify(weeklyData),
        Bucket: bucket,
        Key: `${path}/scores-week-${weeklyData.weekNumber}.json`,
      });
    });
  });
});
