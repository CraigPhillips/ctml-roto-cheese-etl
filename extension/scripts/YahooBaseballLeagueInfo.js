/*
	Represents basic info about the Yahoo Fantasy baseball league shown on the current page.
*/
var YahooBaseballLeagueInfo = YahooBaseballCallbackObject.extend(function() {
	this.teams = {};
	this.teamsLoaded = false;
	this.settingsLoaded = false;
		
	var thisLeagueInfo = this;
	
	var siteRootUrl = $("ul#sitenav > li > a:contains('League')").attr("href");
	if(!siteRootUrl) { this.reportError("Could not locate site root URL while looking up league information."); }
	var managersListPageUrl = siteRootUrl + "/teams";
	
	
	// Retrieves list of teams and their managers.
	$.get(managersListPageUrl)
		.success(function(data, textStatus, jqXHR) {
			var teamRows = $(data).find("table.teamtable tbody tr");
			if(teamRows.length == 0) { thisLeagueInfo.reportError("No teams found on managers list page while loading league information."); return; }
			
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
		
	var settingsPageUrl = siteRootUrl + "/settings";
	
	// Retrieves information about league settings.
	$.get(settingsPageUrl)
		.success(function(data, textStatus, jqXHR) {
			var draftDateParts = thisLeagueInfo.loadSettingsPageValue("Draft Time", $(data)).split(" ");
			if (draftDateParts.length < 3) thisLeagueInfo.reportError(
				"Draft date in unknown format at URL: " + settingsPageUrl + ". Value found was: " + draftDateText);
			var draftDate = new Date(draftDateParts[0] + ", " + draftDateParts[1] + " " + draftDateParts[2] + " " + (new Date()).getFullYear());
			if (!draftDate) thisLeagueInfo.reportError(
				"Unable to create date from found draft value at URL: " + settingsPageUrl + ". Value found was: " + draftDateText);
			
			var leagueUrl = thisLeagueInfo.loadSettingsPageValue("Custom League URL", $(data));
			if (!leagueUrl) thisLeagueInfo.reportError(
				"Unable to load league URL at settings page: " + settingsPageURL);
			
			var batCategoryText = thisLeagueInfo.loadSettingsPageValue("Batters Stat Categories", $(data));
			var pitchCategoryText = thisLeagueInfo.loadSettingsPageValue("Pitchers Stat Categories", $(data));
			if (!batCategoryText) thisLeagueInfo.reportError(
				"Unable to load batting categories at settings page: " + settingsPageURL);
			if (!pitchCategoryText) thisLeagueInfo.reportError(
				"Unable to load pitching categories at settings page: " + settingsPageURL);
			var categoriesText = batCategoryText + ", " + pitchCategoryText;
			
			thisLeagueInfo.scoringCategories = [];
			$.each(categoriesText.split(","), function(index, scoringCategory) {
				if(scoringCategory.indexOf("(") > -1 && scoringCategory.indexOf("(") < scoringCategory.length - 1
						&& scoringCategory.indexOf(")") > 0) {
					var abbreviationStartIndex = scoringCategory.lastIndexOf("(") + 1;
					var abbreviationEndIndex = scoringCategory.lastIndexOf(")");
					if(abbreviationStartIndex < abbreviationEndIndex) {
						var abbreviation = scoringCategory.substring(abbreviationStartIndex, abbreviationEndIndex).trim();
						var description = scoringCategory.substring(0, abbreviationStartIndex - 1).trim();
						
						thisLeagueInfo.scoringCategories.push({ abbreviation: abbreviation, description: description });
					}
				}
			});
			
			thisLeagueInfo.draftDate = draftDate;
			thisLeagueInfo.leagueUrl = leagueUrl;
			
			thisLeagueInfo.settingsLoaded = true;
			thisLeagueInfo.checkForCompletion();
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			thisLeagueInfo.reportError("Error retrieving settings page while loading league information. Error was " + errorThrown);
			return;
		});
})
.methods({
	/*
		If all asynchronously loaded sections are finished loading, reports loading as successful. Otherwise, does nothing.
	*/
	checkForCompletion: function() {
		if(this.teamsLoaded && this.settingsLoaded) this.reportSuccess();
	},
	/*
		Pulls the string value of the setting with the provided title from the provided HTML. If the value can not be found, reports an error.
	*/
	loadSettingsPageValue: function(settingsTitleCellValue, settingsPageJQueryObject) {
		if(!settingsPageJQueryObject || !settingsPageJQueryObject.length) settingsPageJQueryObject = $("<div />");
		
		var valueCell = settingsPageJQueryObject.find("td:contains('" + settingsTitleCellValue + "')").siblings().first().find("b");
		if (valueCell.length == 0) this.reportError("Unable to locate setting '" + settingsTitleCellValue + "'.");
		
		return valueCell.text();
	}
});
