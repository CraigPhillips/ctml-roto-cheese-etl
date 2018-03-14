const _ = require('privatize')();
const { actionType, Puppeteer } = require('../browsing/puppeteer');

const { browseTo, click, enterText } = actionType;
const yahooLeagueUrlPrefix = 'https://baseball.fantasysports.yahoo.com/league/';

class League {
  constructor(leagueName, browser = new Puppeteer()) {
    if (!leagueName) throw new Error('missing league name');

    _(this).browser = browser;
    _(this).leagueName = leagueName;
  }

  async dispose() { _(this).browser.dispose(); }

  async getCurrentWeeklyScores() {
    await _(this).browser
      .do([
        { type: browseTo, url: `${yahooLeagueUrlPrefix}${_(this).leagueName}` },
      ]);
  }
}

module.exports = {
  League
};
