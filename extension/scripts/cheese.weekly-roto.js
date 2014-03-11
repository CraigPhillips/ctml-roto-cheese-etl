$(document).ready(function() {
	var leagueInfo = new YahooBaseballLeagueInfo();
	var weeklyRotoContent = "<p id=\"cheese-weekly-loading-message\">Loading...</p>";
	
	leagueInfo
		.whenReady(function() {
			var scoring = new YahooBaseballWeeklyRotoScores(leagueInfo);
			
			if(scoring.errorMessage) { console.error(scoring.errorMessage); weeklyRotoContent = scoring.errorMessage; }
			else {
			}
		})
		.onError(function(error) { console.error(error); weeklyRotoContent = loadingError; });
});
