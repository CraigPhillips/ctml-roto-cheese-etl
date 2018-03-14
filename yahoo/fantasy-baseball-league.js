const _ = require('privatize')();
const { actionType, Puppeteer } = require('../browsing/puppeteer');

const { browseTo, click, enterText } = actionType;
const yahooLeagueUrlPrefix = 'https://baseball.fantasysports.yahoo.com/league/';

class League {
  constructor(leagueName, browser = new Puppeteer()) {
    if (!leagueName) throw new Error('missing league name');

    _(this).browser = browser;
    _(this).leagueName = leagueName;
    _(this).password = process.env.FE_CHEESE_YAHOO_PASS;
    _(this).userName = process.env.FE_CHEESE_YAHOO_USER;
  }

  async dispose() { _(this).browser.dispose(); }

  async getCurrentWeeklyScores() {
    await _(this).browser
      .do([
        { type: browseTo, url: `${yahooLeagueUrlPrefix}${_(this).leagueName}` },
        { type: enterText, field: '#login-username', value: _(this).userName },
        { type: click, field: '#login-signin' },
        { type: enterText, field: '#login-password', value: _(this).password },
        { type: click, field: '#login-signin' },
      ]);
  }
}

module.exports = {
  League
};
