/*
	Base class for all CTML Basebal cheese classes needing to before long-running operations to load data.
*/
var YahooBaseballCallbackObject = klass(function() {
	this.dataLoadedCallbacks = [];
	this.errorCallbacks = [];
	this.errorMessage = null;
	this.isLoaded = false;
})
.methods({
	// Registers a callback function to use when something goes wrong looking up draft data. An error message will be returned as the first 
	// argument.
	onError: function(callback) {
		if(callback) {
			// If an error has already occured, simply calls back immediately.
			if(this.errorMessage) callback(this.errorMessage);
			else this.errorCallbacks.push(callback);
		}
		
		return this;
	},
	// Reports the fact that an error has occured.
	reportError: function(error) {		
		this.errorMessage = error;
		$(this.errorCallbacks).each(function() { this(error); });
	},
	// Reports the fact that data has been loaded successfully.
	reportSuccess: function() {
		var thisObject = this;
		
		this.isLoaded = true;
		$(this.dataLoadedCallbacks).each(function() { this(thisObject); });
	},
	// Registers a callback function to call when draft data has finished loading. The method will be called back with the object 
	// itself as an argument.
	whenReady: function(callback) {
		if(callback) {
			// If all data is already loaded, simply trigger callback.
			if(this.isLoaded) callback(this);
			// Otherwise, register callback for later use.
			else this.dataLoadedCallbacks.push(callback);
		}

		return this;
	},
	// Extracts player name and ID from a player link.
	extractPlayerDataFromLink: function(playerLink) {
		var playerObject = { name: "", yahooBaseballPlayerId: 0 };
		
		if(playerLink && playerLink.length > 0) {
			var playerName = playerLink.text();
			var playerLink = playerLink.attr("href");
			
			// Verifies that the link is in the format that we want - namely that it ends with a player ID after a slash.
			if(playerName && playerLink && playerLink.indexOf("/") > -1 
					&& playerLink.lastIndexOf("/") < playerLink.length - 1) {
				var playerId = parseInt(
					playerLink.substring(playerLink.lastIndexOf("/") + 1));
				
				if(playerId) {
					playerObject.name = playerName;
					playerObject.playerDetailsPath = playerLink;
					playerObject.yahooBaseballPlayerId = playerId;
				}
			}
		}
		
		return playerObject;
	}
});
