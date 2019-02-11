import privacy from 'private-parts';

import cats from './scoring-categories';

export const defaultPageTimeoutMillis = 120000;

async function getAttribute(page, element, attribute) {
  return page.evaluate(
    (el, att) => (el.getAttribute(att) || '').trim(),
    element,
    attribute,
  );
}

async function getText(page, element) {
  return (await page.evaluate(el => el.textContent || '', element)).trim();
}

let _;
export default class LeagueBrowser {
  constructor(
    leagueUrl,
    user,
    password,
    browser,
    log,
    errorHandler,
    pageTimeout = defaultPageTimeoutMillis,
  ) {
    if (!_) _ = privacy.createKey();

    Object.assign(_(this), {
      browser,
      errorHandler,
      leagueUrl,
      log,
      loggedIn: false,
      pageTimeout,
      password,
      user,
    });
  }

  async close() {
    await _(this).browser.close();
  }

  async getLeagueHomePage() {
    const { leagueUrl, log } = _(this);
    let page;
    try {
      page = await _(this).browser.newPage();
      page.setDefaultTimeout(_(this).pageTimeout);

      log.debug('browsing to league homepage', { leagueUrl });
      await page.goto(leagueUrl);

      if (!_(this).loggedIn) {
        log.debug('entering username', { leagueUrl, user: _(this).user });
        await page.waitForSelector('#login-username');
        await page.focus('#login-username');
        await page.keyboard.type(_(this).user);
        await page.click('#login-signin');

        log.debug('entering password', { leagueUrl });
        await page.waitForSelector('#login-passwd');
        await page.focus('#login-passwd');
        await page.keyboard.type(_(this).password);
        await page.click('#login-signin');
      }

      // waits for this to be visible to insure that login succeeded
      await page.waitForSelector('#matchupweek');

      _(this).loggedIn = true;
    } catch (error) {
      await _(this).errorHandler.handle(error, page);
      if (page) await page.close();
      throw error;
    }

    return page;
  }

  async getLeagueInfo() {
    const { log } = _(this);
    let leagueInfo;
    let page;
    try {
      page = await this.getLeagueHomePage();

      log.debug('collecting team data from league homepage');
      await page.waitForSelector('#matchupweek');
      const teamLinks = await page.$$('#matchupweek .F-link');
      const teams = {};

      /* eslint-disable no-await-in-loop */
      /*
        All of these awaits are calling into puppeteer and so should be pretty
        quick, disregarding ESLint rule about not using awaits in loops.
      */
      for (let i = 0; i < teamLinks.length; i += 1) {
        const link = teamLinks[i];
        const url = await getAttribute(page, link, 'href');
        const logo = (await page.$$(`a[href='${url}'] img.Avatar-med`))[0];
        const teamId = /[0-9]+$/.exec(url)[0];
        teams[teamId] = {
          logo: await getAttribute(page, logo, 'src'),
          name: await getText(page, link),
          url: `${_(this).leagueUrl}/${teamId}`,
        };
      }
      /* eslint-enable no-await-in-loop */
      const teamCount = Object.keys(teams).length;

      log.debug('collecting date data from league homepage');
      const weekDescription = await page.$$(
        '#matchupweek .Inlineblock:not(.F-icon)',
      );
      teams.currentWeek = / [0-9]+ /.exec(
        await getText(page, weekDescription[0]),
      )[0].trim();
      log.debug('collecting matchup links from league homepage');
      // regex: matches // (as in https://) and then the path up to the next /
      const baseUrl = /.*\/\/[^/]*/.exec(_(this).leagueUrl)[0];
      const matchupLinks = (await Promise.all(
        (await page.$$('li.Linkable.Listitem')).map(
          link => getAttribute(page, link, 'data-target'),
        ),
      )).map(relativePath => `${baseUrl}${relativePath}`);

      leagueInfo = {
        baseUrl,
        matchupLinks,
        season: (new Date()).getFullYear().toString(),
        teamCount,
        teams,
        weeklyScores: {},
      };
    } catch (error) {
      await _(this).errorHandler.handle(error, page);
      throw error;
    } finally {
      if (page) await page.close();
    }

    return leagueInfo;
  }

  async getMatchupInfo(matchupUrl, teamCount) {
    const { log } = _(this);
    const matchupInfo = {};
    let matchupPage;
    try {
      log.debug('starting collection of matchup data', { matchupUrl });
      matchupPage = await _(this).browser.newPage();
      matchupPage.setDefaultTimeout(_(this).pageTimeout);
      await matchupPage.goto(matchupUrl);
      const matchupDomType = await Promise.race([
        (async () => {
          await matchupPage.waitForSelector('#matchup-wall-header');
          return 'matchup-wall-header';
        })(),
        (async () => {
          await matchupPage.waitForSelector('.RedZone');
          return 'redzone';
        })(),
      ]);
      log.debug('matchup DOM type found', { matchupDomType, matchupUrl });
      const headerCells = matchupDomType === 'matchup-wall-header'
        ? await matchupPage.$$('#matchup-wall-header th')
        : await matchupPage.$$('.RedZone > table > thead > tr > *');
      const columns = await Promise.all(
        headerCells.map(async cell => getText(matchupPage, cell)),
      );

      /* eslint-disable no-await-in-loop */
      /*
        Cells need to be processed in order so that cells following the second
        team's name will be assigned to the correct team. Can not process these
        loops in parallel.
      */
      let currentTeam;
      const matchupCells = matchupDomType === 'matchup-wall-header'
        ? await matchupPage.$$('#matchup-wall-header td')
        : await matchupPage.$$('.RedZone > table > tbody td');
      for (let i = 0; i < matchupCells.length; i += 1) {
        const header = columns[i % columns.length].toLowerCase();
        const cell = matchupCells[i];
        if (header === 'team') {
          let teamLink = (await cell.$$('a'))[0];
          if (!teamLink) {
            const teamName = await getText(matchupPage, cell);
            const teamLinks = await matchupPage.$$(
              '.RedZone > div > div > div > div > div > a',
            );
            for (let j = 0; j < teamLinks.length; j += 1) {
              if (teamName === await getText(matchupPage, teamLinks[j])) {
                teamLink = teamLinks[j];
                break;
              }
            }
          }

          [currentTeam] = /[0-9]+$/.exec(
            await getAttribute(matchupPage, teamLink, 'href'),
          );
        } else if (!header.endsWith('*') && header !== 'score') {
          if (!currentTeam) throw new Error(`no team, category ${header}`);
          if (!matchupInfo[currentTeam]) {
            matchupInfo[currentTeam] = {
              rank: 1,
              tieCount: 1,
              total: teamCount,
            };
          }

          let parsed = await getText(matchupPage, cell);
          if (parsed === '-') {
            parsed = cats[header].biggerIsBetter ? 0 : Infinity;
          } else parsed = parseFloat(parsed.replace('*', ''));

          matchupInfo[currentTeam][header] = {
            rawScore: parsed,
          };
        }
      }
      /* eslint-enable no-await-in-loop */

      if (Object.keys(matchupInfo).length < 2) {
        log.error('missing matchup data', { matchupUrl, matchupInfo });
        throw new Error('failed to parse scores for both teams');
      }
    } catch (error) {
      await _(this).errorHandler.handle(error, matchupPage);
      throw error;
    } finally {
      if (matchupPage) await matchupPage.close();
    }

    log.debug('finished parsing matchup data', { matchupUrl, matchupInfo });
    return matchupInfo;
  }
}
