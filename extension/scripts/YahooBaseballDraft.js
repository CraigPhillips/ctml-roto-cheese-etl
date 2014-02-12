/*
	Represents the results of a league's draft from a specific year.

	Constructor Parameters:
		customLeaguePath - The final portion of the custom league path defined on the league's settings page as "Custom League URL".
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
	
	if(!customLeaguePath) { this.reportError("Base path for league not provided for draft data lookup."); return; }
	if(!year) { this.reportError("Draft year not provided for draft data lookup."); return; }
	
	if(year < (new Date()).getFullYear()) this.loadDraftInThePast(customLeaguePath, year);
	else this.loadCurrentDraft();
})
.methods({
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
	loadCurrentDraft: function() {
		// Can't see what this looks like at the moment since the league I'm in hasn't yet set a draft order.
		this.reportError("Ability to pull current season's draft picks not available.");
	}
});
