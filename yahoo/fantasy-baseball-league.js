const _ = require('privatize')();
const VError = require('verror');

const { categories } = require('../scoring/categories');
const { actionType, Puppeteer } = require('../browsing/puppeteer');

const { browseTo, click, enterText, getAtts, getText } = actionType;
const allCats = categories.all();
const yahooLeagueUrlPrefix = 'https://baseball.fantasysports.yahoo.com';

async function doInLoggedInBrowser(steps) {
  let preSteps = [
    { type: browseTo, url: `${yahooLeagueUrlPrefix}${_(this).leagueSufx}` }
  ];
  preSteps = preSteps.concat(_(this).loggedIn? [] : [
    { type: enterText, field: '#login-username', value: _(this).userName },
    { type: click, field: '#login-signin' },
    { type: enterText, field: '#login-passwd', value: _(this).password },
    { type: click, field: '#login-signin' },
  ]);

  const result = await _(this).browser.do(preSteps.concat(steps));
  _(this).loggedIn = true;

  return result;
}

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
    _(this).leagueSufx = `/league/${leagueName}`;
    _(this).loggedIn = false;
    _(this).password = process.env.FE_CHEESE_YAHOO_PASS;
    _(this).userName = process.env.FE_CHEESE_YAHOO_USER;
  }

  async dispose() { _(this).browser.dispose(); }

  async getCurrentWeeklyScores() {
    const matchupStatuses = [];
    const scores = {};

    const weeklyMatchups = await doInLoggedInBrowser.call(this, [{
      type: getAtts,
      field: '#matchupweek [data-target^="/b1"]',
      att: 'data-target'
    }]);

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

  async getTeams() {
    const teams = {};

    const [nav, text, logos, logoMap] = await doInLoggedInBrowser.call(this, [
      { type: getAtts, field: '#sitenav a', att: 'href' },
      { type: getText, field: '#sitenav a' },
      { type: getAtts, field: '.Tst-manager img.Avatar-sm', att: 'src' },
      { type: getAtts, field: '.Tst-manager a:first-of-type', att: 'href' },
    ]);
    const managersUrl = nav[text.indexOf('Managers')];

    const [names, urls, owners, profiles] = await _(this).browser.do([
      { type: browseTo, url: `${yahooLeagueUrlPrefix}${managersUrl}` },
      { type: getText, field: '#teams td:first-of-type' },
      { type: getAtts, field: '#teams td:first-of-type a', att: 'href' },
      { type: getText, field: '#teams td.user-id a' },
      { type: getAtts, field: '#teams td.user-id a', att: 'href' }
    ]);

    for (let i of names.keys()) {
      const teamId = urls[i].match(/[\d]+$/)[0];

      teams[teamId] = {
        logo: logos[logoMap.indexOf(urls[i])],
        name: names[i],
        url: `${yahooLeagueUrlPrefix}${urls[i]}`,
        owner: owners[i],
        ownerProfile: profiles[i],
      };
    }

    return teams;
  }
}

module.exports = {
  League
};
