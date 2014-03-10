$(document).ready(function() {
	var leagueInfo = new YahooBaseballLeagueInfo();
	var weeklyRotoContent = "<p id=\"cheese-weekly-loading-message\">Loading...</p>";
	
	leagueInfo
		.whenReady(function() {
			console.log(leagueInfo);
		})
		.onError(function(error) { console.error(error); weeklyRotoContent = loadingError; });
});
