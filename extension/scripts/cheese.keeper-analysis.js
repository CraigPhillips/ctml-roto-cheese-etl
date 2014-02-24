$(document).ready(function() {		
	var leagueInfo = new YahooBaseballLeagueInfo();
	leagueInfo
		.whenReady(function() {
			// If the draft date has not yet passed, displays draft analysis
			if((new Date()) < leagueInfo.draftDate) {
				var topContentContainer = $("#matchupsmacktabbed");
				var loadingError = "<p id='cheese-keeper-loading-message' class='F-shade'>There was an error producing this information.</p>";
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
					attachEvents();
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
					var thisTeam = new YahooBaseballTeamDetails(this.teamPageUrl, this);
					teams.push(thisTeam);
					callbackObjects.push(thisTeam);
				});
				var asyncCallbackObjects = new YahooBaseballCallbackObjectSet(callbackObjects);
				
				asyncCallbackObjects
					.whenReady(function() {
						// Manually reorders teams - needed until draft order is actually set.
						var reorderedTeams = [
							teams[5],
							teams[7],
							teams[1],
							teams[8],
							teams[3],
							teams[6],
							// Scott hasn't signed up yet.
							{},
							teams[2],
							teams[0],
							teams[4]
						];
							
						var keeperAnalysis = createKeeperAnalysisUsingSnakeDraft(lastDraft, thisDraft, reorderedTeams, 18, 2);
						var keeperTemplate = new DustTemplate("cheese.keeper-analysis");
						var keeperAnalysisViewModel = { analysis: keeperAnalysis, teams: teams };
						
						keeperTemplate.render(keeperAnalysisViewModel, function(error, out) {
							if(error) console.error(error);
								
							keeperContent = error?
								loadingError :
								out;
							
							// If the keeper analysis tab is selected, puts the newly-loaded content in place.
							if(keeperNavItem.hasClass("Selected")) {									
								tabContentContainer.html(keeperContent);
								attachEvents();
							}
						});
					})
					.onError(function(error) { console.error(error); keeperContent = loadingError; });
			}
		})
		.onError(function(error) { console.error(error); keeperContent = loadingError; });
});

/*
	Creates draft analysis from data about last year's draft, this year's draft and current rosters.
*/
function createKeeperAnalysisUsingSnakeDraft(lastDraft, thisDraft, teams, defaultPlayerRound, keeperRoundCost) {
	var keeperValues = [];
	
	$.each(teams, function(teamIndex, team) {
		var teamOrder = teamIndex + 1;
		
		if(team.roster) {
			$.each(team.roster, function(playerId, player) {
				var keeperValue = {};
				if(lastDraft.draftResults[playerId]) keeperValue.previousDraftRound = lastDraft.draftResults[playerId].draftRound;
				if(!keeperValue.previousDraftRound) keeperValue.previousDraftRound = defaultPlayerRound;
				
				keeperValue.potentialKeeperRound = keeperValue.previousDraftRound - keeperRoundCost;
				if(keeperValue.potentialKeeperRound < 1) keeperValue.potentialKeeperRound = "-";
				
				keeperValue.potentialKeeperPick = 
					// Reverses team order on even rounds
					keeperValue.potentialKeeperRound % 2 == 0?
						(keeperValue.potentialKeeperRound - 1) * teams.length + (teams.length - teamOrder + 1) :
						(keeperValue.potentialKeeperRound - 1) * teams.length + teamOrder;
				if(!keeperValue.potentialKeeperPick) keeperValue.potentialKeeperPick = "-";
						
				keeperValue.defaultDraftPick = thisDraft.preDraftRankings[playerId];
				
				keeperValue.keeperDiscount = keeperValue.potentialKeeperPick - keeperValue.defaultDraftPick;
				if(!keeperValue.keeperDiscount) keeperValue.keeperDiscount = "-";
				
				keeperValue.playerData = player;
				keeperValue.teamData = team;
				
				keeperValues.push(keeperValue);
			});
		}
	});
	
	keeperValues.sort(function(keeperA, keeperB) {
		var returnValue = 0;
		
		if(keeperA.keeperDiscount == keeperB.keeperDiscount) {
			returnValue = keeperB.playerData.playerName > keeperA.playerData.playerName? 1 : -1;
		}
		else if (keeperB.keeperDiscount == "-") {
			returnValue = -1;
		}
		else if (keeperA.keeperDiscount == "-") {
			return Value = 1;
		}
		else {
			returnValue = keeperB.keeperDiscount  - keeperA.keeperDiscount;
		}
		
		return returnValue;
	});
	
	return keeperValues;
}

/*
	Responds to a show/hide checkbox being checked.
*/
function showHideCheckboxChecked(button) {
	if(button.length != 0) {
		var teamId = parseInt(button.attr("data-team-id"));
		if(teamId) {
			$("#cheese-keeper-analysis ul li[data-team-id='" + teamId + "']").toggleClass("hidden");
		}
	}
};

/*
	After inserting HTML, attaches needed events.
*/
function attachEvents() {	
	$("#cheese-keeper-controls input[type='checkbox']").click(function() {
		showHideCheckboxChecked($(this));
	});
	
	$("#cheese-keeper-controls .check-all-button").click(function() {
		$("#cheese-keeper-controls input[type='checkbox']:not(:checked)").click();
	});
	
	$("#cheese-keeper-controls .uncheck-all-button").click(function() {
		$("#cheese-keeper-controls input[type='checkbox']:checked").click();
	});
}
