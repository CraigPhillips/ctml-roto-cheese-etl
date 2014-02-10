/*
	Represents the results of a league's draft from a specific year.

	Constructor Parameters:
		customLeaguePath - The final portion of the custom league path defined on the league's settings page as "Custom League URL". As
			an example, if the path is "http://baseball.fantasysports.yahoo.com/league/chickentendermelt", this should be "chickentendermelt".
		year - The numeric year containing the draft represented by this object. (For example: 2013)
*/

function YahooBaseballDraft(
		customLeaguePath,
		year,
		loadedNotificationCallback,
		errorNotificationCallback) {
	this.customLeaguePath = customLeaguePath;
	this.dataLoadedCallbacks = new Array();
	this.draftResults = new Array();
	this.errorCallbacks = new Array();
	this.errorMessage = null;
	this.isLoaded = false;
	this.year = year;
	
	var thisDraft = this;
	
	// Reports the fact that an error has occurred.
	var reportError = function(error) {
		thisDraft.errorMessage = error;
		
		// Calls each registered error callback.
		$(thisDraft.errorCallbacks).each(function() { this(error); });
	};
	
	if(!customLeaguePath) { reportError("Base path for league not provided for draft data lookup."); return; }
	if(!year) { reportError("Draft year not provided for draft data lookup."); return; }

	var leagueBasePath = "/league/" + customLeaguePath + "/" + year;
	
	// Retrieves homepage for requested season.
	$.get(leagueBasePath)
		.success(function(data, textStatus, jqXHR) {
			var draftLink = $(data).find("#yspsubnav ul li a:contains('Draft Results')");
			if(draftLink.length == 0) { reportError("No draft link found on league page while looking up draft data."); return; };
			
			var draftPath = draftLink.attr("href");
			
			// Retrieves draft listing.
			$.get(draftPath)
				.success(function(data, textStatus, jqXHR) {
					var pickedPlayerLinks = $(data).find("td.player a");
					if(pickedPlayerLinks.length == 0) { reportError("No player links found on draft page while looking up draft data."); return; }
					
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
					
					// Loading has completed so calls registered callbacks.
					thisDraft.isReady = true;
					$(thisDraft.dataLoadedCallbacks).each(function() { this(thisDraft); });
				})
				.fail(function (jqXHR, textStatus, errorThrown) {
					reportError("Error loading season's draft results draft data at URL: " + draftPath +
						". Error was '" + errorThrown + "'.");
				});
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			reportError("Error loading season's homepage during draft data lookup at URL: " + leagueBasePath +
				". Error was: '" + errorThrown + "'.");
		});
}

/*
	Registers a callback function to call when draft data has finished loading. The method will be called back with the object itself as an argument.
*/
YahooBaseballDraft.prototype.whenReady = function(callback) {
	if(callback) {
		// If all data is already loaded, simply trigger callback.
		if(this.isLoaded) callback(this);
		// Otherwise, register callback for later use.
		else this.dataLoadedCallbacks.push(callback);
	}
	
	return this;
};

/*
	Registers a callback function to use when something goes wrong looking up draft data. An error message will be returned as the first argument.
*/
YahooBaseballDraft.prototype.onError = function(callback) {
	if(callback) {
		// If an error has already occured, simply calls back immediately.
		if(this.errorMessage) callback(errorMessage);
		else this.errorCallbacks.push(callback);
	}
	
	return this;
};