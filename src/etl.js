// import beThere from 'be-there.js';
import privacy from 'private-parts';

import addRotoScores from './add-roto-scores.js';

let _;
export default class ETL {
  constructor(leagueBrowser, resultsPublisher, log) {
    if (!_) _ = privacy.createKey();

    Object.assign(_(this), {
      leagueBrowser,
      log,
      resultsPublisher,
    });
    // beThere(_(this));
  }

  async dispose() {
    await _(this).leagueBrowser.close();
  }

  async run() {
    const { leagueBrowser, log, resultsPublisher } = _(this);
    try {
      const leagueInfo = await leagueBrowser.getLeagueInfo();
      const getMatchupPromises = leagueInfo.matchupLinks
        .map(link => leagueBrowser.getMatchupInfo(link, leagueInfo.teamCount));
      const matchupData = await Promise.all(getMatchupPromises);
      leagueInfo.weeklyScores = matchupData
        .reduce((soFar, matchup) => Object.assign(soFar, matchup), {});

      leagueInfo.weeklyScores = addRotoScores(
        leagueInfo.weeklyScores,
        leagueInfo.teams.currentWeek,
        log,
      );

      await resultsPublisher.publishTeamData(leagueInfo.teams);
      await resultsPublisher.publishWeeklyRotoData(leagueInfo.weeklyScores);
    } catch (error) {
      log.error('ETL failure', { error });
      throw error;
    }
  }
}
