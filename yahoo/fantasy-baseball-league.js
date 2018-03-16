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

    const matchupStatuses = [];
    for (let matchup of weeklyMatchups) {
      // regex: matches any number following mid{X}= where {X} is one digit
      const teamNumbers = matchup.match(/(?<=mid[\d]=)[\d]+/g);
      matchupStatuses.push({
        teamNumbers,
        readAttempt: _(this).browser
          .do([
            { type: browseTo, url: `${yahooLeagueUrlPrefix}${matchup}` },
            { type: getText, field: '#matchup-wall-header th' },
            { type: getText, field: '#matchup-wall-header td' },
          ])
      });
    }

    const results = await Promise.all(matchupStatuses.map(s => s.readAttempt));
    const scores = {};
    for (let i of results.keys()) {
      const teams = matchupStatuses[i].teamNumbers;
      const [categories, values] = results[i];
      const team1Score = {};
      const team2Score = {};
      for (let catI of categories.keys()) {
        const cat = categories[catI].toLowerCase().replace('*', '');
        const team1Value = values[catI] === '-' ? 0 : values[catI];
        const catI2 = catI + categories.length;
        const team2Value = values[catI2] === '-' ? 0 : values[catI2];
        team1Score[cat] = parseFloat(team1Value);
        team2Score[cat] = parseFloat(team2Value);
      }

      scores[teams[0]] = team1Score;
      scores[teams[1]] = team2Score;
    }

    console.log(scores);
  }
}

module.exports = {
  League
};
