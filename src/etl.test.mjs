import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import ETL from './etl.mjs';
import NoOpLog from '../test/no-op-log.mjs';

chai.should();
chai.use(chaiAsPromised);

describe('ETL', () => {
  const f = () => {};
  const fakeLink = 'link';
  const teamCount = 2;
  const tieCount = teamCount;

  let log;
  const mockBrowser = { close: f, getLeagueInfo: f, getMatchupInfo: f };
  const mockPublisher = { publishTeamData: f, publishWeeklyRotoData: f };
  let stubs;

  beforeEach(() => {
    log = new NoOpLog();

    stubs = {
      close: sinon
        .stub(mockBrowser, 'close')
        .returns(Promise.resolve()),
      getLeagueInfo: sinon
        .stub(mockBrowser, 'getLeagueInfo')
        .returns(new Promise((resolve) => {
          resolve({
            matchupLinks: [fakeLink],
            teamCount,
            teams: { currentWeek: 1 },
          });
        })),
      getMatchupInfo: sinon
        .stub(mockBrowser, 'getMatchupInfo')
        .returns(new Promise((resolve) => {
          resolve({
            1: { rank: 1, tieCount, total: 1.5, r: { rawScore: 1 } },
            2: { rank: 1, tieCount, total: 1.5, r: { rawScore: 1 } },
          });
        })),
      publishTeamData: sinon
        .stub(mockPublisher, 'publishTeamData')
        .returns(Promise.resolve()),
      publishWeeklyRotoData: sinon
        .stub(mockPublisher, 'publishWeeklyRotoData')
        .returns(Promise.resolve()),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('dispose', () => {
    it('should close disposable resources', async () => {
      const etl = new ETL(mockBrowser, mockPublisher, log);

      await etl.dispose();

      sinon.assert.called(stubs.close);
    });
  });

  describe('run', () => {
    it('should publish weekly results and team info', async () => {
      const etl = new ETL(mockBrowser, mockPublisher, log);

      await etl.run();

      sinon.assert.called(stubs.getLeagueInfo);
      sinon.assert.calledWith(stubs.getMatchupInfo, fakeLink, teamCount);
      sinon.assert.calledWith(stubs.publishTeamData, { currentWeek: 1 });
      sinon.assert.called(stubs.publishWeeklyRotoData);
    });

    it('should log and rethrow ETL errors', async () => {
      stubs.getLeagueInfo.restore();
      stubs.getLeagueInfo = sinon
        .stub(mockBrowser, 'getLeagueInfo')
        .throws(new Error('fake ETL error'));
      const etl = new ETL(mockBrowser, mockPublisher, log);

      await etl.run().should.be.rejectedWith('fake ETL error');
      log.errors.length.should.equal(1);
      log.errors[0].length.should.equal(2);
      log.errors[0][0].should.match(/^ETL failure.*/);
      log.errors[0][1].error.message.should.equal('fake ETL error');
    });
  });
});
