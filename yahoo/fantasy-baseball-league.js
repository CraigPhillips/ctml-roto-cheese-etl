const _ = require('privatize')();
const VError = require('verror');

const { categories } = require('../scoring/categories');
const { actionType, Puppeteer } = require('../browsing/puppeteer');

const { browseTo, click, enterText, getAtts, getText } = actionType;
const allCats = categories.all();
const yahooLeagueUrlPrefix = 'https://baseball.fantasysports.yahoo.com';

function parseWeeklyScoreValue(value, cat) {
  if (!value) throw new Error('no value to parse');
  const biggerIsBetter =
    allCats.indexOf(cat) === -1 || categories.detailsFor(cat).biggerIsBetter;
  const defaultVal = biggerIsBetter? 0 : Infinity;

  let parsed = value === '-' ? defaultVal : parseFloat(value.replace('*', ''));
  if (isNaN(parsed)) parsed = value;

  return parsed;
}

function parseWeeklyScoreResults(results, isSecondTeam) {
  const score = {};

  try {
    if (!results) throw new Error('no results to parse');
    if (results.length < 2) throw new Error('missing categories or results');

    const [categories, values] = results;

    for (let i of categories.keys()) {
      const cat = categories[i].toLowerCase().replace('*', '');
      const value = values[isSecondTeam ? i + categories.length : i];

      if (cat.indexOf('/') === -1) {
        score[cat] = parseWeeklyScoreValue(value, cat);
      } else {
        const cats = cat.split('/');
        const values = value.split('/');
        for (let catI of cats.keys()) {
          score[cats[catI]] = parseWeeklyScoreValue(values[catI], cats[catI]);
        }
      }
    }

  } catch(parseError) {
    throw new VError(parseError, 'failed to parse results');
  }

  return score;
}

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
    const matchupStatuses = [];
    const scores = {};

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
    for (let i of results.keys()) {
      const teams = matchupStatuses[i].teamNumbers;
      scores[teams[0]] = parseWeeklyScoreResults(results[i]);
      scores[teams[1]] = parseWeeklyScoreResults(results[i], false);
    }

    return scores;
  }
}

module.exports = {
  League
};
