/*
	Represents the results of a league's draft from a specific year.

	Constructor Parameters:
		customLeaguePath - The custom league path defined on the league's settings page as "Custom League URL".
		year - The numeric year containing the draft represented by this object. (For example: 2013) If this year is in the past
		that year's results are loaded. If it is the current year, loads the draft order.
*/
var YahooBaseballDraft = YahooBaseballCallbackObject.extend(function(
		customLeaguePath,
		year,
		loadedNotificationCallback,
		errorNotificationCallback) {
	this.customLeaguePath = customLeaguePath;
	this.draftResults = {};
	this.year = year;
	this.preDraftRankings = {};
	
	if(!customLeaguePath) { this.reportError("Base path for league not provided for draft data lookup."); return; }
	if(!year) { this.reportError("Draft year not provided for draft data lookup."); return; }
	
	if(year < (new Date()).getFullYear()) this.loadDraftInThePast(customLeaguePath, year);
	else this.loadCurrentDraft(customLeaguePath);
})
.methods({
	// Loads results from previous draft.
	loadDraftInThePast: function(customLeaguePath, year) {
		var leagueBasePath = customLeaguePath + "/" + year;
		var thisDraft = this;
		
		// Retrieves homepage for requested season.
		$.get(leagueBasePath)
			.success(function(data, textStatus, jqXHR) {
				var draftLink = $(data).find("#yspsubnav ul li a:contains('Draft Results')");
				if(draftLink.length == 0) { thisDraft.reportError("No draft link found on league page while looking up draft data."); return; };
				
				var draftPath = draftLink.attr("href");
				
				// Retrieves draft listing.
				$.get(draftPath)
					.success(function(data, textStatus, jqXHR) {
						var pickedPlayerLinks = $(data).find("td.player a");
						if(pickedPlayerLinks.length == 0) { 
							thisDraft.reportError("No player links found on draft page while looking up draft data."); 
							return; 
						}
						
						// Pulls requested data out of HTML.
						var nextPlayerDraftPosition = 1;
						pickedPlayerLinks.each(function() {
							var playerData = thisDraft.extractPlayerDataFromLink($(this));
							
							if(playerData && playerData.name && playerData.yahooBaseballPlayerId) {
								playerData.draftPosition = nextPlayerDraftPosition++;
								
								var draftRoundText = $(this).parents("table").find("th:contains('Round')").text();
								var draftRoundParts = draftRoundText.split(" ");
								var draftRound = draftRoundParts.length > 1? parseInt(draftRoundParts[1]) : 0;
								if(draftRound) playerData.draftRound = draftRound;
								
								thisDraft.draftResults[playerData.yahooBaseballPlayerId] =
									playerData;
							}
						});
						
						// Loading has completed so calls registered callbacks.
						thisDraft.reportSuccess();
					})
					.fail(function (jqXHR, textStatus, errorThrown) {
						thisDraft.reportError("Error loading season's draft results draft data at URL: " + draftPath +
							". Error was '" + errorThrown + "'.");
					});
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				thisDraft.reportError("Error loading season's homepage during draft data lookup at URL: " + leagueBasePath +
					". Error was: '" + errorThrown + "'.");
			});
		},
	// Loads default player rankings for current season.
	loadCurrentDraft: function(leagueBasePath) {
		var thisDraft = this;
		
		$.get(leagueBasePath)
			.success(function(data, textStatus, jqXHR) {
				var draftRankingsUrl = $(data).find("#sitenav ul li a:contains('Pre-Draft Rankings')").attr("href");
				var editDraftRankingsUrl = draftRankingsUrl.replace("/prerank", "/editprerank");
				
				$.post(editDraftRankingsUrl, { count: "ALL", pos: "ALL" })
					.success(function(data, textStatus, jqXHR) {
						var targetVariableIndicator = "var allPlayers";
							
						var rankingsScript = $(data).find("script:contains('" + targetVariableIndicator + "')");
						if (rankingsScript.length == 0) { 
							thisDraft.reportError("Could not locate rankings on edit rankings page at URL: " + editDraftRankingsUrl); 
							return; 
						}
						
						// Runs the portion of script with variable which contains player data so it is available in memory.
						var targetVariableStartIndex = rankingsScript.text().indexOf(targetVariableIndicator);
						var targetVariableEndIndex = rankingsScript.text().indexOf(";", targetVariableEndIndex);
						if(targetVariableEndIndex < targetVariableStartIndex) {
							thisDraft.reportError("Could not find player list in edit rankings page at URL: " + editDraftRankingsUrl);
							return;
						}
						var targetVariableScriptText = rankingsScript.text().substring(
							targetVariableStartIndex, targetVariableEndIndex + 1);
						eval(targetVariableScriptText);
						
						$(allPlayers).each(function() {
							thisDraft.preDraftRankings[this.pid] = parseInt(this.rank);
						});
						
						// Loading has finished, so reports success
						thisDraft.reportSuccess();
					})
					.fail(function(jqXHR, textStatus, errorThrown) {
						thisDraft.reportError("Error loading draft rankings page: " + preDraftRankEditUrl +
							". Error was: '" + errorThrown + "'.");
					});
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				thisDraft.reportError("Error loading league homepage during draft data lookup at URL: " + leagueBasePath +
					". Error was: '" + errorThrown + "'.");
			});
	}
});
