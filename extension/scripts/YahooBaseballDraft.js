/*
	Represents the results of a league's draft from a specific year.

	Constructor Parameters:
		customLeaguePath - The final portion of the custom league path defined on the league's settings page as "Custom League URL". As
			an example, if the path is "http://baseball.fantasysports.yahoo.com/league/chickentendermelt", this should be "chickentendermelt".
		year - The numeric year containing the draft represented by this object. (For example: 2013)\
		loadedNotificationCallback - Function to call when stats are ready.
		errorNotificationCallback - Function to call if something goes retrieving data. An argument is allowed which will be be the
			errorThrown returned by an AJAX call.
*/

function YahooBaseballDraft(
		customLeaguePath,
		year,
		loadedNotificationCallback,
		errorNotificationCallback) {
	this.customLeaguePath = customLeaguePath;
	this.draftResults = new Array();
	this.loadedNotificationCallback = loadedNotificationCallback;
	this.year = year;
	
	if(!customLeaguePath) throw "Base path for league not provided for draft data lookup.";
	if(!year) throw "Draft year not provided for draft data lookup.";

	var leagueBasePath = "/league/" + customLeaguePath + "/" + year;
	var thisDraft = this;
	
	// Retrieves homepage for requested season.
	$.get(leagueBasePath)
		.success(function(data, textStatus, jqXHR) {
			var draftLink = $(data).find("#yspsubnav ul li a:contains('Draft Results')");
			if(draftLink.length == 0) throw "No draft link found on league page while looking up draft data.";
			
			var draftPath = draftLink.attr("href");
			
			// Retrieves draft listing.
			$.get(draftPath)
				.success(function(data, textStatus, jqXHR) {
					var pickedPlayerLinks = $(data).find("td.player a");
					if(pickedPlayerLinks.length == 0) throw "No player links found on draft page while looking up draft data.";
					
					// Pulls requested data out of HTML.
					pickedPlayerLinks.each(function() {
						var playerName = $(this).text();
						var playerLink = $(this).attr("href");
						
						if(playerName && playerLink && playerLink.indexOf("/") > -1 
								&& playerLink.lastIndexOf("/") < playerLink.length - 1) {
							var playerId = parseInt(
								playerLink.substring(playerLink.lastIndexOf("/") + 1));
							
							if(playerId) thisDraft.draftResults.push({ name: playerName, yahooPlayerId: playerId });
						}
					});
					
					if(thisDraft.loadedNotificationCallback) thisDraft.loadedNotificationCallback();
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					console.log("Error loading season's draft results draft data at URL: " + draftPath +
						". Error was '" + errorThrown + "'.");
				});
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log("Error loading season's homepage during draft data lookup at URL: " + leagueBasePath +
				". Error was: '" + errorThrown + "'.");
			
			if(errorNotificationCallback) errorNotificationCalback(errorThrown);
		});
}