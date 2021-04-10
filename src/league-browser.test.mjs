import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import cats from './scoring-categories.mjs';
import ErrorHandler from './error-handler.mjs';
import LeagueBrowser, { defaultPageTimeoutMillis } from './league-browser.mjs';
import NoOpLog from '../test/no-op-log.mjs';
import Metrics from './metrics.mjs';

chai.should();
chai.use(chaiAsPromised);

describe('LeagueBrowser', () => {
  const currentWeek = 13;
  const f = () => {};
  const keyboard = { type: f };
  const leagueBaseUrl = 'https://fake-league-url';
  const leagueUrl = `${leagueBaseUrl}/1234`;
  const matchupCategoryHeaderNonScoring = 'non-scoring category*';
  const matchupCategoryOverallScore = 'score';
  const matchupPath = '/fake-matchup-path';
  const matchupPathFull = `${leagueUrl}/${matchupPath}`;
  const page = {
    $$: f,
    click: f,
    close: f,
    evaluate: (evaluator, el, attr) => evaluator(el, attr),
    focus: f,
    goto: f,
    keyboard,
    setDefaultTimeout: f,
    waitForSelector: f,
  };
  const password = 'fake-password';
  const teamCount = 10;
  const teamId1 = '10';
  const teamId2 = '9';
  const teamName = 'fake team name';
  const teamUrl = `fake-team-url/${teamId1}`;
  const teamLogoUrl = 'fake-team-logo-url';
  const user = 'fake-user';

  let browser;
  let errorHandler;
  let leagueBrowser;
  let log;
  let metrics;
  let stubs;
  let teamLink;

  beforeEach(() => {
    browser = { close: f, newPage: async () => page };
    errorHandler = new ErrorHandler({}, {}, {});
    log = new NoOpLog();
    metrics = new Metrics({});
    teamLink = { getAttribute: () => teamUrl, textContent: teamName };

    stubs = {
      browserClose: sinon.stub(browser, 'close').returns(Promise.resolve()),
      click: sinon.stub(page, 'click').returns(Promise.resolve()),
      close: sinon.stub(page, 'close').returns(Promise.resolve()),
      focus: sinon.stub(page, 'focus').returns(Promise.resolve()),
      goto: sinon.stub(page, 'goto').returns(Promise.resolve()),
      handleError: sinon
        .stub(errorHandler, 'handle')
        .returns(Promise.resolve()),
      recordMatchupDomType: sinon
        .stub(metrics, 'recordMatchupDomType')
        .returns(Promise.resolve()),
      select: sinon.stub(page, '$$'),
      setTimeout: sinon.stub(page, 'setDefaultTimeout'),
      type: sinon.stub(keyboard, 'type').returns(Promise.resolve()),
      waitForSelector: sinon
        .stub(page, 'waitForSelector')
        .returns(Promise.resolve()),
    };

    leagueBrowser = new LeagueBrowser(
      leagueUrl,
      user,
      password,
      browser,
      log,
      metrics,
      errorHandler,
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getLeagueHomePage', () => {
    it('should log into and load league home page', async () => {
      const homePage = await leagueBrowser.getLeagueHomePage();

      homePage.should.equal(page);
      sinon.assert.calledWith(stubs.setTimeout, defaultPageTimeoutMillis);
      sinon.assert.calledWith(stubs.waitForSelector, '#login-username');
      sinon.assert.calledWith(stubs.focus, '#login-username');
      sinon.assert.calledWith(stubs.type, user);
      sinon.assert.calledWith(stubs.click, '#login-signin');
      sinon.assert.calledWith(stubs.waitForSelector, '#login-passwd');
      sinon.assert.calledWith(stubs.focus, '#login-passwd');
      sinon.assert.calledWith(stubs.type, password);
      sinon.assert.calledWith(stubs.click, '#login-signin');
      sinon.assert.calledWith(stubs.waitForSelector, '#matchupweek');
    });

    it('should only log in once', async () => {
      const firstHomePage = await leagueBrowser.getLeagueHomePage();
      const secondHomePage = await leagueBrowser.getLeagueHomePage();

      firstHomePage.should.equal(page);
      secondHomePage.should.equal(page);
      sinon.assert.calledTwice(stubs.type);
    });

    it('should throw error on page loading error', async () => {
      const error = new Error('fake error');
      stubs.goto.restore();
      stubs.goto = sinon.stub(page, 'goto').throws(error);

      await leagueBrowser.getLeagueHomePage().should.be.rejectedWith(
        error.message,
      );

      sinon.assert.calledWith(stubs.handleError, error, page);
      sinon.assert.called(stubs.close);
    });

    it('should throw error on page startup error', async () => {
      const error = new Error('fake error');
      browser.newPage = async () => { throw error; };
      leagueBrowser = new LeagueBrowser(
        leagueUrl,
        user,
        password,
        browser,
        log,
        metrics,
        errorHandler,
      );

      await leagueBrowser.getLeagueHomePage().should.be.rejectedWith(
        error.message,
      );

      sinon.assert.calledWith(stubs.handleError, error);
      sinon.assert.notCalled(stubs.close);
    });
  });

  describe('getLeagueInfo', () => {
    let matchupLink;
    let teamLogo;
    let weekDescription;

    beforeEach(() => {
      matchupLink = { getAttribute: () => matchupPath };
      teamLogo = { getAttribute: () => teamLogoUrl };
      weekDescription = { textContent: `week ${currentWeek} matchups` };

      stubs.select
        .withArgs('#matchupweek .F-link')
        .returns([teamLink])
        .withArgs(`a[href='${teamUrl}'] img.Avatar-med`)
        .returns([teamLogo])
        .withArgs('#matchupweek .Inlineblock:not(.F-icon)')
        .returns([weekDescription])
        .withArgs('li.Linkable.Listitem')
        .returns([matchupLink]);
    });

    it('should return basic info', async () => {
      sinon.stub(leagueBrowser, 'getLeagueHomePage').returns(page);

      const leagueInfo = await leagueBrowser.getLeagueInfo();

      sinon.assert.calledWith(stubs.waitForSelector, '#matchupweek');
      leagueInfo.baseUrl.should.equal(leagueBaseUrl);
      leagueInfo.matchupLinks.length.should.equal(1);
      leagueInfo.matchupLinks[0].should.equal(`${leagueBaseUrl}${matchupPath}`);
      leagueInfo.season.should.equal(new Date().getFullYear().toString());
      leagueInfo.teamCount.should.equal(1);
      leagueInfo.teams.currentWeek.should.equal(currentWeek.toString());
      const team = leagueInfo.teams[teamId1];
      team.logo.should.equal(teamLogoUrl);
      team.name.should.equal(teamName);
      team.url.should.equal(`${leagueUrl}/${teamId1}`);
      leagueInfo.weeklyScores.should.deep.equal({});
    });

    it('should return empty values when attribute is missing', async () => {
      sinon.stub(leagueBrowser, 'getLeagueHomePage').returns(page);
      stubs.select
        .withArgs(`a[href='${teamUrl}'] img.Avatar-med`)
        .returns([{ getAttribute: () => undefined }]);

      const leagueInfo = await leagueBrowser.getLeagueInfo();

      leagueInfo.teams[teamId1].logo.should.equal('');
    });

    it('should return empty values when text is missing', async () => {
      sinon.stub(leagueBrowser, 'getLeagueHomePage').returns(page);
      stubs.select
        .withArgs('#matchupweek .F-link')
        .returns([{ getAttribute: () => teamUrl, textContent: undefined }]);

      const leagueInfo = await leagueBrowser.getLeagueInfo();

      leagueInfo.teams[teamId1].name.should.equal('');
    });

    it('should throw error on homepage retrieval error', async () => {
      const err = new Error('fake error');
      sinon.stub(leagueBrowser, 'getLeagueHomePage').throws(err);

      await leagueBrowser.getLeagueInfo().should.be.rejectedWith(err.message);

      sinon.assert.calledWith(stubs.handleError, err, undefined);
      sinon.assert.notCalled(stubs.close);
    });
  });

  describe('getMatchupInfo', () => {
    let headerCells;
    let matchupCells;

    beforeEach(() => {
      headerCells = [{ textContent: 'team' }]
        .concat(Object.keys(cats).map(cat => ({
          textContent: cat,
        })))
        .concat([
          { textContent: matchupCategoryHeaderNonScoring },
          { textContent: matchupCategoryOverallScore },
        ]);
      matchupCells = [{ $$: () => [{ getAttribute: () => teamId1 }] }]
        .concat(Object.keys(cats).map(() => ({ textContent: '0' })))
        .concat([{ textContent: '0' }, { textContent: '0' }])
        .concat([{ $$: () => [{ getAttribute: () => teamId2 }] }])
        .concat(Object.keys(cats).map(() => ({ textContent: '-' })))
        .concat([{ textContent: '0' }, { textContent: '0' }]);

      stubs.waitForSelector
        .withArgs('.RedZone')
        .returns(new Promise((resolve) => { setTimeout(resolve, 100); }));

      stubs.select
        .withArgs('#matchup-wall-header th')
        .returns(headerCells)
        .withArgs('.RedZone > table > tbody td')
        .returns(new Promise((resolve) => { setTimeout(resolve, 100); }))
        .withArgs('#matchup-wall-header td')
        .returns(matchupCells);
    });

    it('should retrieve matchup information', async () => {
      const matchupInfo = await leagueBrowser
        .getMatchupInfo(matchupPathFull, teamCount);

      sinon.assert.calledWith(stubs.setTimeout, defaultPageTimeoutMillis);
      sinon.assert.calledWith(stubs.goto, matchupPathFull);
      sinon.assert.called(stubs.close);
      sinon.assert
        .calledWith(stubs.recordMatchupDomType, 'matchup-wall-header');
      // one key for each scoring category plus, rank, tieCount and total
      const expectedKeysCount = Object.keys(cats).length + 3;
      Object.keys(matchupInfo[teamId1]).length.should.equal(expectedKeysCount);
      Object.keys(matchupInfo[teamId2]).length.should.equal(expectedKeysCount);
      matchupInfo[teamId1].rank.should.equal(1);
      matchupInfo[teamId1].tieCount.should.equal(1);
      matchupInfo[teamId1].total.should.equal(teamCount);
      matchupInfo[teamId2].rank.should.equal(1);
      matchupInfo[teamId2].tieCount.should.equal(1);
      matchupInfo[teamId2].total.should.equal(teamCount);
      Object.keys(cats).forEach((cat) => {
        matchupInfo[teamId1][cat].rawScore.should.equal(0);
        matchupInfo[teamId2][cat].rawScore.should.equal(
          cats[cat].biggerIsBetter ? 0 : Infinity,
        );
      });
    });

    it('should retrieve matchup information using Redzone DOM', async () => {
      const altTeamLinks = [
        { textContent: 'some other link' },
        teamLink,
      ];
      matchupCells[0] = { $$: () => [undefined], textContent: teamName };

      stubs.waitForSelector
        .withArgs('.RedZone')
        .returns(Promise.resolve())
        .withArgs('#matchup-wall-header')
        .returns(new Promise((resolve) => { setTimeout(resolve, 100); }));

      stubs.select
        .withArgs('#matchup-wall-header th')
        .returns(new Promise((resolve) => { setTimeout(resolve, 100); }))
        .withArgs('.RedZone > table > thead > tr > *')
        .returns(headerCells)
        .withArgs('.RedZone > table > tbody td')
        .returns(matchupCells)
        .withArgs('.RedZone > div > div > div > div > div > a')
        .returns(altTeamLinks);

      const matchupInfo = await leagueBrowser
        .getMatchupInfo(matchupPathFull, teamCount);

      sinon.assert.calledWith(stubs.setTimeout, defaultPageTimeoutMillis);
      sinon.assert.calledWith(stubs.goto, matchupPathFull);
      sinon.assert.called(stubs.close);
      sinon.assert.calledWith(stubs.recordMatchupDomType, 'redzone');
      // one key for each scoring category plus, rank, tieCount and total
      const expectedKeysCount = Object.keys(cats).length + 3;
      Object.keys(matchupInfo[teamId1]).length.should.equal(expectedKeysCount);
      Object.keys(matchupInfo[teamId2]).length.should.equal(expectedKeysCount);
      matchupInfo[teamId1].rank.should.equal(1);
      matchupInfo[teamId1].tieCount.should.equal(1);
      matchupInfo[teamId1].total.should.equal(teamCount);
      matchupInfo[teamId2].rank.should.equal(1);
      matchupInfo[teamId2].tieCount.should.equal(1);
      matchupInfo[teamId2].total.should.equal(teamCount);
      Object.keys(cats).forEach((cat) => {
        matchupInfo[teamId1][cat].rawScore.should.equal(0);
        matchupInfo[teamId2][cat].rawScore.should.equal(
          cats[cat].biggerIsBetter ? 0 : Infinity,
        );
      });
    });

    it('should throw error on seeing category before team', async () => {
      headerCells.shift();
      stubs.select
        .withArgs('#matchup-wall-header th')
        .returns(headerCells);

      await leagueBrowser
        .getMatchupInfo(matchupPathFull, teamCount)
        .should.be
        .rejectedWith(`no team, category ${Object.keys(cats)[0]}`);
      sinon.assert.called(stubs.close);
    });

    it('should throw error if less than two matchups are found', async () => {
      stubs.select
        .withArgs('#matchup-wall-header td')
        .returns(matchupCells.splice(matchupCells.length / 2));

      await leagueBrowser
        .getMatchupInfo(matchupPathFull, teamCount)
        .should.be
        .rejectedWith('failed to parse scores for both teams');
    });

    it('should skip matchup page close if it fails to open', async () => {
      const err = new Error('fake error');
      browser.newPage = async () => { throw err; };

      await leagueBrowser
        .getMatchupInfo(matchupPathFull, teamCount)
        .should.be
        .rejectedWith(err.message);
      sinon.assert.notCalled(stubs.close);
    });
  });

  describe('close', () => {
    it('should close underlying resources', async () => {
      await leagueBrowser.close();

      sinon.assert.called(stubs.browserClose);
    });
  });
});
