/*
	Base class for all CTML Basebal cheese classes needing to before long-running operations to load data.
*/
var YahooBaseballCallbackObject = klass(function() {
	this.dataLoadedCallbacks = new Array();
	this.errorCallbacks = new Array();
	this.errorMessage = null;
	this.isLoaded = false;
})
.methods({
	// Registers a callback function to use when something goes wrong looking up draft data. An error message will be returned as the first 
	// argument.
	onError: function(callback) {
		if(callback) {
			// If an error has already occured, simply calls back immediately.
			if(this.errorMessage) callback(errorMessage);
			else this.errorCallbacks.push(callback);
		}
		
		return this;
	},
	// Reports the fact that an error has occured.
	reportError: function(error) {
		var thisObject = this;
		
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
	}
});
