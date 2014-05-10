/*
	Contains logic for converting teams' weekly performance into Rotosserie-style scoring.
*/
var YahooBaseballWeeklyRotoScores = klass(function(leagueInfo) {
	this.teamScores = [];
	this.statScores = {};
		
	if(!leagueInfo || !leagueInfo instanceof YahooBaseballWeeklyRotoScores) {
		this.errorMessage = "League info wasn't provided to constructor.";
		return;
	}
	if(!leagueInfo.weeklyScoresLoaded || !leagueInfo.settingsLoaded) {
		this.errorMessage = "League info not fully loaded.";
		return;
	}
	
	var thisRotoScoreSet = this;
	
	// Calculates roto scores for each team individually.
	$.each(leagueInfo.teamScoresInCurrentWeek, function(index, currentTeamScores) {
			var currentTeamRoto = { 
				categoryScores: [],
				overallScore: 0,
				teamId: currentTeamScores.teamId,
				teamLogoUrl: currentTeamScores.teamLogoUrl,
				teamName: currentTeamScores.teamName,
				teamPageUrl: currentTeamScores.teamPageUrl
			};
			
			// Calculates scores by each category
			$.each(leagueInfo.foundScoringCategories, function(index, scoringCategory) {
				var categoryScore = { 
					categoryAbbreviation: scoringCategory.abbreviation,
					categoryName: scoringCategory.description,
					place: 1,
					points: 0,
					teamId: currentTeamScores.teamId,
					teamLogoUrl: currentTeamScores.teamLogoUrl,
					teamName: currentTeamRoto.teamName,
					teamPageUrl: currentTeamScores.teamPageUrl,
					tiedCount: 1
				};
				
				var currentTeamScoreInCategory = currentTeamScores.scores[scoringCategory.abbreviation];
				currentTeamScoreInCategory = parseFloat(currentTeamScoreInCategory.toString());
				if(!currentTeamScoreInCategory && currentTeamScoreInCategory != 0) {
					thisRotoScoreSet.errorMessage = 
						"Could not find score for category '" + scoringCategory.description + "' for target team " + currentTeamScores.teamName;
					return;
				}
				categoryScore.rawScore = currentTeamScoreInCategory;
				
				// Checks this scoring category each other team in the league
				$.each(leagueInfo.teamScoresInCurrentWeek, function(index, comparingTeamScores) {	
				    var comparingTeamScoreInCategory = comparingTeamScores.scores[scoringCategory.abbreviation];
				    comparingTeamScoreInCategory = parseFloat(comparingTeamScoreInCategory.toString());
					if(!comparingTeamScoreInCategory && comparingTeamScoreInCategory != 0) {
						thisRotoScoreSet.errorMessage =
							"Could not find score for category '" + scoringCategory.description + "' for comparing team " + currentTeamScores.teamName;
						return;
					}
						
					// If this is the same team as the team for which scores are being calculated,
					// grants a single point
					if(currentTeamScores.teamId == comparingTeamScores.teamId) {
						categoryScore.points++;
					}
					// Processes ties
					else if(currentTeamScoreInCategory == comparingTeamScoreInCategory) {
						categoryScore.points += .5;
						categoryScore.tiedCount++;
					}
					// Processes being ahead of the other team
					else if(
							(currentTeamScoreInCategory > comparingTeamScoreInCategory 
								&& scoringCategories[scoringCategory.abbreviation].higherIsBetter) ||
							(currentTeamScoreInCategory < comparingTeamScoreInCategory
								&& !scoringCategories[scoringCategory.abbreviation].higherIsBetter)) {
						categoryScore.points++;
					}
					// Processes being behind the other team
					else {
						categoryScore.place++;
					}
				});
				categoryScore.overallPlace = categoryScore.place;
				
				currentTeamRoto.categoryScores.push(categoryScore);
				currentTeamRoto.overallScore += categoryScore.points;

				// Slots this team's category score into alternate score storage scheme
				if(!thisRotoScoreSet.statScores[categoryScore.categoryAbbreviation])
					thisRotoScoreSet.statScores[categoryScore.categoryAbbreviation] = [];
				thisRotoScoreSet.statScores[categoryScore.categoryAbbreviation].push(categoryScore);
			});
			
			thisRotoScoreSet.teamScores.push(currentTeamRoto);
	});

	// Reorders each by-category score list
	$.each(this.statScores, function(category, scoreList) {
		scoreList.sort(function(scoreA, scoreB) {
			var sortValue = 0;

			var scoreAPlace = scoreA.place;
			var scoreBPlace = scoreB.place;

			// Attempts to order by place, but if that is the same, orders by team name, and if that is the same, just used team ID.
			if(scoreAPlace != scoreBPlace) sortValue = scoreAPlace - scoreBPlace;
			else {
				if(scoreA.teamName > scoreB.teamName) sortValue = 1;
				else if(scoreA.teamName < scoreB.teamName) sortValue = -1;
				else sortValue = scoreA.teamId - scoreB.teamId;
			}

			return sortValue;
		});
	});
	
	// Calculates overall team placement
	$.each(thisRotoScoreSet.teamScores, function(index, currentTeamScore) {
		currentTeamScore.overallPlace = 1;
		currentTeamScore.overallTieCount = 1;
		
		$.each(thisRotoScoreSet.teamScores, function(index, comparingTeamScore) {
			// No need to compare against the team's own scores
			if(currentTeamScore.teamId != comparingTeamScore.teamId) {
				// Processes being tied with another team, overall
				if(currentTeamScore.overallScore == comparingTeamScore.overallScore) {
					currentTeamScore.overallTieCount++;
				}
				// Processes being behind another team (being ahead requires not additional processing)
				else if(currentTeamScore.overallScore < comparingTeamScore.overallScore) {
					currentTeamScore.overallPlace++;
				}
			}
		});
	});

	this.reorder();
})
.methods({
	reorder: function() {
		this.teamScores.sort(function(scoreA, scoreB) {
			var sortValue = 0;
			
			var scoreAPlace = scoreA.overallPlace;
			var scoreBPlace = scoreB.overallPlace;
			
			// Attempts to order by place, but if that is the same, orders by team name.
			if(scoreAPlace != scoreBPlace) sortValue = scoreAPlace - scoreBPlace;
			else {
				if(scoreA.teamName > scoreB.teamName) sortValue = 1;
				else if(scoreA.teamName < scoreB.teamName) sortValue = -1;
			}
			
			return sortValue;
		});
	}
});
