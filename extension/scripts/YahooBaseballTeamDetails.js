/*
	Represents the details for a particular team located at the provided URL.
	
	Constructor arguements:
	- teamPageUrl - The URL at which the team's roster page can be found.
*/
var YahooBaseballTeamDetails = YahooBaseballCallbackObject.extend(function(teamPageUrl) {
		if(!teamPageUrl) this.reportError("Team page URL not available when attempting to lookup team details.");
		
		this.teamPageUrl = teamPageUrl;
		this.roster = {};
		
		thisTeamDetails = this;
		
		$.get(teamPageUrl)
			.success(function(data, textStatus, jqXHR) {
				var playerLinks = $(data.content).find(".ysf-player-name a");
				if(playerLinks.length == 0) { thisTeamDetails.reportError("No players found on team details page. URL was: " + teamPageUrl); return; }
				
				playerLinks.each(function() {
					var playerData = thisTeamDetails.extractPlayerDataFromLink($(this));
					
					if(playerData.name && playerData.yahooBaseballPlayerId) 
						thisTeamDetails.roster[playerData.yahooBaseballPlayerId] = playerData;
				});
					
				thisTeamDetails.reportSuccess();
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				thisTeamDetails.reportError("Error retrieving team details page. URL was: " + teamPageUrl);
			});
		
});
