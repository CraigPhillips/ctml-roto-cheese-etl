$(document).ready(function() {		
	var leagueInfo = new YahooBaseballLeagueInfo();
	leagueInfo
		.whenReady(function() {
			// If the draft date has not yet passed, displays draft analysis
			if((new Date()) < leagueInfo.draftDate) {
				var topContentContainer = $("#matchupsmacktabbed");
				if(topContentContainer.length == 0) { console.error("Could not locate content area to display draft analysis."); return; }
				
				var lastNavItem = topContentContainer.find(".Navitem").last();
				if(lastNavItem.length == 0) { console.error("Could not locate item needed to insert keeper analysis tab."); return; }
				
				var tabContentContainer = topContentContainer.children("div");
				if(tabContentContainer.length == 0) { console.error("Could not locate content area to which keper analysis is to be added."); return; }
				
				// Inserts and attaches events to keeper analysis tab
				var keeperNavItem = lastNavItem.clone().attr("id", "keeper-analysis-tab");
				var keeperLink = keeperNavItem.find("a");
				// Sets default loading message which is used as the tab content until actual content is loaded
				var keeperContent = "<p id='cheese-keeper-loading-message' class='F-shade'>Loading keeper information...</p>";
				keeperLink.attr("href", "").attr("id", "keeper-analysis-link");
				keeperLink.text("Keeper Analysis");
				lastNavItem.after(keeperNavItem);
				keeperNavItem.click(function(clickEvent) {
					clickEvent.preventDefault();
					clickEvent.stopPropagation();
					
					// Changes which tab is shown as selected
					keeperNavItem.siblings(".Selected").removeClass("Selected");
					keeperNavItem.addClass("Selected");
					
					// Adds analysis content to content area
					tabContentContainer.html(keeperContent);
				});
				
				// Creates all asynchronously-loading object
				var thisYear = (new Date()).getFullYear();
				var lastDraft = new YahooBaseballDraft(leagueInfo.leagueUrl, thisYear - 1);
				var thisDraft = new YahooBaseballDraft(leagueInfo.leagueUrl, thisYear);
				var teams = [];
				var callbackObjects = [];
				callbackObjects.push(lastDraft);
				callbackObjects.push(thisDraft);
				$.each(leagueInfo.teams, function() { 
					var thisTeam = new YahooBaseballTeamDetails(this.teamPageUrl);
					teams.push(thisTeam);
					callbackObjects.push(thisTeam);
				});
				var asyncCallbackObjects = new YahooBaseballCallbackObjectSet(callbackObjects);
				
				asyncCallbackObjects
					.whenReady(function() {
						var keeperAnalysis = createKeeperAnalysis(lastDraft, thisDraft, teams);
					})
					.onError(function(error) { console.error(error); });
			}
		})
		.onError(function(error) { console.error(error); });
});

/*
	Creates draft analysis from data about last year's draft, this year's draft and current rosters.
*/
function createKeeperAnalysis(lastDraft, thisDraft, teams) {
	console.log(lastDraft, thisDraft, teams);
}
