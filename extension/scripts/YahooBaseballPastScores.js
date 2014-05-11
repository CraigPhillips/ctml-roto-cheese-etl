/*
	Retrieves scores of past weeks from a remote server.
*/
var YahooBaseballPastScores = YahooBaseballCallbackObject.extend(function(pastScoreUrl) {
	this.scores = [];

	if(!pastScoreUrl) {
		this.reportError("No URL was provided for JSON file containing pastScores.");
		return;
	}

	var thisScoreSet = this;

	// Makes request for remote past scores file. This is a cross-domain request but will be allowed if the domain being requested is explictly
	// allowed in the Chrome extension by a "permissions" object in the extension's manifest.
	$.getJSON(pastScoreUrl, function(data) {
		if(data) {
			if(Object.prototype.toString.call(data) === '[object Array]') {
				thisScoreSet.scores = data;
				thisScoreSet.reportSuccess();
			}
			else {
				thisScoreSet.reportError("Past score file was retrieved at URL \"" + pastScoreUrl + "\" but data found is not in an array.");
			}
		}
		else {
			thisScoreSet.reportError("Past scores file was retrieved at URL \"" + pastScoreUrl + "\" but no scores were found.");
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		thisScoreSet.reportError("Unable to load remote file at URL \"" + pastScoreUrl + "\". Error was: " + errorThrown);
	});
});
