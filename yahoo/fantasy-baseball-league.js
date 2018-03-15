const _ = require('privatize')();
const { actionType, Puppeteer } = require('../browsing/puppeteer');

const { browseTo, click, enterText, getAtts, getText } = actionType;
const yahooLeagueUrlPrefix = 'https://baseball.fantasysports.yahoo.com';

class League {
  constructor(leagueName, browser = new Puppeteer()) {
    if (!leagueName) throw new Error('missing league name');

    _(this).browser = browser;
    _(this).league = leagueName;
    _(this).password = process.env.FE_CHEESE_YAHOO_PASS;
    _(this).userName = process.env.FE_CHEESE_YAHOO_USER;
  }

  async dispose() { _(this).browser.dispose(); }

  async getCurrentWeeklyScores() {
    const leagueSuffix = `/league/${_(this).league}`;

    const weeklyMatchups = await _(this).browser
      .do([
        { type: browseTo, url: `${yahooLeagueUrlPrefix}${leagueSuffix}` },
        { type: enterText, field: '#login-username', value: _(this).userName },
        { type: click, field: '#login-signin' },
        { type: enterText, field: '#login-passwd', value: _(this).password },
        { type: click, field: '#login-signin' },
        {
          type: getAtts,
          field: '#matchupweek [data-target^="/b1"]',
          att: 'data-target'
        },
      ]);

    console.log(weeklyMatchups);

    for (let matchup of weeklyMatchups) {
      // regex: matches any number following mid{X}= where {X} is one digit
      const teamNumbers = matchup.match(/(?<=mid[\d]=)[\d]+/g);
      const [categories, scores] = await _(this).browser
        .do([
          { type: browseTo, url: `${yahooLeagueUrlPrefix}${matchup}` },
          { type: getText, field: '#matchup-wall-header th' },
          { type: getText, field: '#matchup-wall-header td' },
        ]);

      console.log(teamNumbers);
      console.log(categories);
      console.log(scores);
      console.log();
    }
  }
}

module.exports = {
  League
};
