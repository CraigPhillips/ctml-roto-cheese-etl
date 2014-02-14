/*
    Operations for working with a group of objects which take a bit to load and require callbacks before they are ready to use.
*/
var YahooBaseballCallbackObjectSet = klass(function (callbackObjects) {
    this.callbackObjects = [];

    thisSet = this;

    $(callbackObjects).each(function () {
        var thisCallback = this;
        var getType = {};

        // Verifies that each object has a whenReady and onError method and if so, adds them to this set.
        if (thisCallback
                && thisCallback.whenReady && getType.toString.call(thisCallback.whenReady) === '[object Function]'
                && thisCallback.onError && getType.toString.call(thisCallback.onError) == '[object Function]') {
            thisSet.callbackObjects.add(thisCallback);
        }
    });
});