/*
	Contains logic for converting teams' weekly performance into Rotosserie-style scoring.
*/
var YahooBaseballWeeklyRotoScores = klass(function(leagueInfo) {
	this.teamScores = [];
		
	if(!leagueInfo || !leagueInfo instanceof YahooBaseballWeeklyRotoScores) {
		this.errorMessage = "League info wasn't provided to constructor.";
		return;
	}
	if(!leagueInfo.weeklyScoresLoaded || !leagueInfo.settingsLoaded) {
		this.errorMessage = "League info not fully loaded.";
		return;
	}
	
	var thisRotoScoreSet = this;
	
	console.log(leagueInfo);
	// Calculates roto scores for each team individually.
	$.each(leagueInfo.teamScoresInCurrentWeek, function(index, currentTeamsScores) {
			var currentTeamRoto = { 
				categoryScores: [],
				overallScore: 0,
				teamId: currentTeamsScores.teamId,
				teamName: currentTeamsScores.teamName, 
				teamPageUrl: currentTeamsScores.teamPageUrl
			};
			
			// Calculates scores by each category
			$.each(leagueInfo.scoringCategories, function(index, scoringCategory) {
				var categoryScore = { 
					categoryAbbreviation: scoringCategory.abbreviation,
					categoryName: scoringCategory.description,
					place: 1,
					tiedCount: 0
				};
			});
			
			thisRotoScoreSet.teamScores.push(currentTeamRoto);
	});
})
.methods({
});
