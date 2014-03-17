$(document).ready(function() {
	var leagueInfo = new YahooBaseballLeagueInfo();
	var weeklyRotoContent = "<p id=\"cheese-weekly-loading-message\">Loading...</p>";
	var scoringContent = "";
	var loadingError = "<p id=\"cheese-weekly-loading-message\">An error occurred while loading the weekly rotisserie standings.</p>";
	var rootWeeklyRotoTemplate = new DustTemplate("cheese.weekly-roto.main");
	var overallRotoScoresTemplate = new DustTemplate("cheese.weekly-roto.overall-scores");
	
	leagueInfo
		.whenReady(function() {
			var scoring = new YahooBaseballWeeklyRotoScores(leagueInfo);
			
			if(scoring.errorMessage) { console.error(scoring.errorMessage); weeklyRotoContent = scoring.errorMessage; }
			else {
				var topContentContainer = $("#matchupsmacktabbed");
				if(topContentContainer.length == 0) { console.error("Could not locate content area to display draft analysis."); return; }
				
				var lastNavItem = topContentContainer.find(".Navitem").last();
				if(lastNavItem.length == 0) { console.error("Could not locate item needed to insert keeper analysis tab."); return; }
				
				var tabContentContainer = topContentContainer.children("div");
				if(tabContentContainer.length == 0) { console.error("Could not locate content area to which roto score is to be added."); return; }
				
				// Inserts and attaches events to weekly roto tab
				var rotoNavItem = lastNavItem.clone().attr("id", "weekly-roto-tab");
				var rotoLink = rotoNavItem.find("a");
				rotoLink.attr("href", "").attr("id", "weekly-roto-link");
				rotoLink.text("Weekly Roto");
				lastNavItem.after(rotoNavItem);
				rotoNavItem.click(function(clickEvent) {
					clickEvent.preventDefault();
					clickEvent.stopPropagation();
					
					// Changes which tab is shown as selected
					rotoNavItem.siblings(".Selected").removeClass("Selected");
					rotoNavItem.addClass("Selected");
					
					// Adds analysis content to content area
					tabContentContainer.html(weeklyRotoContent);	
					attachTopLevelRotoEvents();
					$("ul.team-scores").html(scoringContent);
					
					// Hides weekly naviation element
					$("#matchup_week_nav").hide();
				});
				
				rootWeeklyRotoTemplate.render(leagueInfo, function(error, rotoWrapperContent) {
					if(error) {
						console.error("Unable to render weekly root roto content. Error was: " + error);
						weeklyRotoContent = loadingError;
					}
					else {
						overallRotoScoresTemplate.render(scoring, function(error, overallScoringContent) {
							console.log(leagueInfo);
							console.log(scoring);
							
							weeklyRotoContent = rotoWrapperContent;
							scoringContent = overallScoringContent;
							
							// If weekly tab is selected, puts the newly-loaded content in place.
							if(rotoNavItem.hasClass("Selected")) {									
								tabContentContainer.html(content);
								attachTopLevelRotoEvents();
							}
						});
					}
				});
			}
		})
		.onError(function(error) { console.error(error); weeklyRotoContent = loadingError; });
});

function attachTopLevelRotoEvents() {
}

