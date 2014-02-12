$(document).ready(function() {
	/*var draftInfo = new YahooBaseballDraft("chickentendermelt", 2013);
	draftInfo
		.whenReady(function() { console.log(draftInfo); })
		.onError(function(error) { console.error(error); });*/
		
	var leagueInfo = new YahooBaseballLeagueInfo();
	leagueInfo
		.whenReady(function() { 
			console.log(leagueInfo);
			/*var firstTeam = new YahooBaseballTeamDetails(leagueInfo.teams[1].teamPageUrl);
			
			firstTeam
				.whenReady(function() { console.log(firstTeam); })
				.onError(function(error) { console.error(error); });*/
		})
		.onError(function(error) { console.error(error); });
});

