/*
	Represents basic info about the Yahoo Fantasy baseball league shown on the current page.
*/
var YahooBaseballLeagueInfo = YahooBaseballCallbackObject.extend(function() {
	this.teams = {};
	this.teamsLoaded = false;
	this.settingsLoaded = false;
		
	var thisLeagueInfo = this;
	
	var managersListPageUrl = $("ul#sitenavsub li a:contains('Managers')").attr("href");
	if(!managersListPageUrl) { this.reportError("Managers list link not found when attempting to load league information."); return; }
	
	$.get(managersListPageUrl)
		.success(function(data, textStatus, jqXHR) {
			var teamRows = $(data).find("table.teamtable tbody tr");
			if(teamRows.length == 0) { this.reportError("No teams found on managers list page while loading league information."); return; }
			
			$(teamRows).each(function() {
					var teamPageLink = $(this).find("td.first a");
					var teamUrl = teamPageLink.attr("href");
					// Verifies that a URL is found, contains a path separator but doesn't end in a path separator
					if(!teamUrl || !teamUrl.indexOf("/") == -1 || teamUrl.lastIndexOf("/") == teamUrl.length - 1) {
						thisLeagueInfo.reportError("Team page URL was malformed while attempting to load league information. URL was: " + teamUrl);
						return;
					}
					
					var teamId = parseInt(teamUrl.substring(teamUrl.lastIndexOf("/") + 1));
					if(!teamId) { thisLeagueInfo.reportError("Team ID not found in team URL. URL was: " + teamUrl); return; }
					
					var teamName = teamPageLink.text();
					if(!teamName) { thisLeagueInfo.reportError("Team name could not be found in team link for team with ID: " + teamId); return; }
					
					var teamManagerLink = $(this).find("td.user-id a");
					var teamManagerName = teamManagerLink.text();
					if(!teamManagerName) { thisLeagueInfo.reportError("Team manager name not found for team with ID: " + teamId); return; }
					
					var teamManagerUrl = teamManagerLink.attr("href");
					if(!teamManagerUrl) { thisLeagueInfo.reportError("Team manager URL not found for team with ID: " + teamId); return; }
					
					thisLeagueInfo.teams[teamId] = { 
						teamId: teamId,
						teamManagerName: teamManagerName,
						teamManagerPageUrl: teamManagerUrl,
						teamName: teamName,
						teamPageUrl: teamUrl 
					};
			});
			
			thisLeagueInfo.teamsLoaded = true;
			thisLeagueInfo.checkForCompletion();
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			thisLeagueInfo.reportError("Error attempting to retrieve managers list page while loading league information. Error was " + errorThrown);
		});
		
	var settingsPageUrl = $("ul#sitenavsub li a:contains('Scoring & Settings')").attr("href");
	if(!settingsPageUrl) { this.reportError("Settings page link not found while loading league information."); return; }
	
	$.get(settingsPageUrl)
		.success(function(data, textStatus, jqXHR) {
			var draftDateTitleCell = $(data).find("td:contains('Draft Time')");
			var draftDateText = $(draftDateTitleCell).siblings().first().find("b").text();
			var draftDateParts = draftDateText.split(" ");
			var draftDate = new Date(draftDateParts[0] + ", " + draftDateParts[1] + " " + draftDateParts[2] + " " + (new Date()).getFullYear());
			
			if(draftDate) thisLeagueInfo.draftDate = draftDate;
			thisLeagueInfo.settingsLoaded = true;
			thisLeagueInfo.checkForCompletion();
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			thisLeagueInfo.reportError("Error retrieving settings page while loading league information. Error was " + errorThrown);
			return;
		});
})
.methods({
	checkForCompletion: function() {
		if(this.teamsLoaded && this.settingsLoaded) this.reportSuccess();
	}
});
