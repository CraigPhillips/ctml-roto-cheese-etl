/*
    Operations for working with a group of objects which take a bit to load and require callbacks before they are ready to use.
*/
var YahooBaseballCallbackObjectSet = YahooBaseballCallbackObject.extend(function(callbackObjects) {
    var storedCallbackObjects = [];
    var thisSet = this;
    var callbacksCompleted = 0;
    
    $(callbackObjects).each(function() {
        var thisCallback = this;
        var getType = {};

        // Verifies that each object has a whenReady and onError method and if so, adds them to this set.
        if (thisCallback
                && thisCallback.whenReady && getType.toString.call(thisCallback.whenReady) === '[object Function]'
                && thisCallback.onError && getType.toString.call(thisCallback.onError) == '[object Function]') {
            storedCallbackObjects.push(thisCallback);
        }
    });
    
    $(storedCallbackObjects).each(function() {
    		var thisCallback = this;
    		
			thisCallback
				.whenReady(function() {						
					// Waits for all objects in the set to complete before reporting a completion.
					if(++callbacksCompleted == callbackObjects.length) {
						thisSet.reportSuccess();
					}
				})
				.onError(function(error) { thisSet.reportError(error); });
    });
});