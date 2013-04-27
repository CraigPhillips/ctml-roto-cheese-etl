var attrBackgroundColor = "background-color";
var attrDataPosType = "data-pos-type";
var attrId = "id";
var attrLeft = "left";
var attrHref = "href";
var attrShouldPrintScores = "printScores";
var attrSrc = "src";
var attrTitle = "title";
var attrWeekIndex = "weekindex";

var colorDefaultSummaryBackgroundColor = "#FFFFFF";
var colorHighlitSummaryBackgroundColor = colorDefaultSummaryBackgroundColor;

var classCtmlNavItem = "ctmlnavitem";
var classDetailsControl = "detailscontrol";
var classDetailRank = "detailrank";
var classDetailScore = "detailscore";
var classFirst = "first";
var classLast = "last";
var classKpiBad = "kpibad";
var classKpiGood = "kpigood";
var classMyTeam = "myteam";
var classScoreTabSelected = "selected";
var classSelected = "selected";
var classDisabled = "disabled";
var classTeamDetails = "teamdetails";
var classTeamScore = "teamscore";
var classTeamSummary = "teamsummary";

var defaultWeekNumber = -1;

var descriptionCollapseScoringDetails = "Hide scoring details.";
var descriptionExpandScoringDetails = "See scoring details.";
var descriptionNext = "Later Weeks";
var descriptionPrevious = "Earlier Weeks";
var descriptionTotals = "Totals";
var descriptionTotalsIdentifier = "CTML";

var emptyScoreValue = "-";

var idCtmlDisplayDescription = "ctmldisplaydescription";
var idCtmlNavControls = "ctmlnavcontrols";
var idCtmlScoreBoard = "ctmlscoreboard";
var idCtmlScoreList = "ctmltotalscores";
var idCtmlWeeklyTab = "ctmlweekly";
var idWeekNav = "weeknav";
var idWeekNavContainer = "weeknavcontainer";
var idWeekNavNext = "weeknavnext";
var idWeekNavPrevious = "weeknavprev";
var idWeeksList = "weekslist";

var indicatorPsuedoTie = "*";

var imageSrcDetailsExpand = chrome.extension.getURL("images/expand.gif");
var imageSrcDetailsCollapse = chrome.extension.getURL("images/collapse.gif");
var imageSrcNextArrow = chrome.extension.getURL("images/right.png");
var imageSrcPreviousArrow = chrome.extension.getURL("images/left.png");

var isTabExposed = false;

var myTeamName = "";

var pastScores = null;

var regExAllPseudoTieIndicators = "/" + indicatorPsuedoTie + "/g";

var selectorBody = "body";
var selectorCtmlDisplayDescription = "#" + idCtmlDisplayDescription;
var selectorCtmlNavControls = "#" + idCtmlNavControls;
var selectorCtmlNavItems = "." + classCtmlNavItem;
var selectorCtmlNavItemSelected = selectorCtmlNavItems + "." + classScoreTabSelected;
var selectorCtmlScoreBoard = "#" + idCtmlScoreBoard;
var selectorCtmlScoreList = "#" + idCtmlScoreList;
var selectorCtmlWeeklyTab = "#" + idCtmlWeeklyTab;
var selectorDefaultScoreTabs = "#scoreboardtabs ul li.first, #scoreboardtabs ul li.last";
var selectorDetailsControls = "." + classDetailsControl;
var selectorDetailRank = "." + classDetailRank;
var selectorDetailScore = "." + classDetailScore;
var selectorDetailHighlights = selectorDetailRank + ", " + selectorDetailScore;
var selectorHead = "head";
var selectorInningsPitchedContainer = ".sum > ul > li.non-scoring";
var selectorListItems = "li";
var selectorMatchUpLinks = "#scoreboard-fantasy .yfa-permalinks a";
var selectorMatchUpTitle = "#matchup-h1 > h1";
var selectorMyTeamSection = "." + classMyTeam;
var selectorMyTeamLink = "#standingstable .selected a";
var selectorStatNameHolders = "#matchup-summary-table thead tr.headerRow1 th.desc > div";
var selectorTeamDetails = "." + classTeamDetails;
var selectorVisibleTeamDetails = "." + classTeamDetails + ":visible";
var selectorTeamRosterLinks = "#scoreboard-fantasy a.yfa-team";
var selectorTeamLink = "td.team a";
var selectorTeamRows = "#matchup-summary-table tbody tr";
var selectorTeamRowNameHolder = ".team a";
var selectorTeamRowStatHolders = ".stat";
var selectorTeamScore = "." + classTeamScore;
var selectorTeamSummary = "." + classTeamSummary;
var selectorScoreBoardContentArea = "#scoreboard .yfa-submods #scoreboard-fantasy";
var selectorRealScoresContentArea = "#scoreboard .yfa-submods #scoreboard-real";
var selectorScoreTabsList = "#scoreboardtabs ul";
var selectorWeekNav = "#" + idWeekNav;
var selectorWeekNavContainer = "#" + idWeekNavContainer;
var selectorWeekNavNext = "#" + idWeekNavNext;
var selectorWeekNavPrev = "#" + idWeekNavPrevious;
var selectorWeeksList = "#" + idWeeksList;
var selectorWeekSelectLinks = "#scoreboard-fantasy .yfa-subnav a";

var standings;
var standingsCurrent;

var teamLinks = new Array();

var styleExpandingElement = {
	opacity: 0,
	width: 0 
};
var styleDefaultHeight = {
	height: "auto"
};

var templateCtmlClearBar = "<div class='ctmlclearbar'></div>";
var templateCtmlNavItem = "<div id='{0}' class='" + classCtmlNavItem + "' title='{1}'>{2}</div>";
var templateCtmlWeeklyTab = "<li id='" + idCtmlWeeklyTab + "'><a href='#'>CTML (Weekly)</a></li>";
var templateCtmlScoreBoard = 
	"<div id='" + idWeekNavContainer + "'>" +
		"<div id='" + idWeekNavPrevious + "'></div>" +
		"<ul id='" + idWeekNav + "'></ul><div id='" + idWeekNavNext + "'></div>" +
	"</div>" +
	"<h4>Standings (<span id='" + idCtmlDisplayDescription + "'></span>)</h4>" +
	"<ul id='" + idCtmlScoreList + "'></ul>" +
	"<div id='" + idCtmlNavControls + "'></div>";
var templateCtmlScoreBoardItem =
	"<li>" +
        "<div class='" + classTeamSummary + "'>" +
		    "<div class='teamname'>{0}) {1}</div>" +
		    "<div class='" + classDetailsControl + "'></div>" +
		    "<div class='" + classTeamScore +"'>{2}</div>" +
		    "<div class='ctmlclearbar'></div>" +
        "</div>" +
		"<table class='" + classTeamDetails + "'>" +
			"<tr>" +
				"<th class='detailitemlabel'>Category</th>" +
				"<th class='detailitemlabel'>Rank</th>" + 
			"</tr>" +
		"</table>" +
	"</li>";
var templateCtmlScoreBoardDetailItem =
	"<tr title='{0}: {1}'>" +
		"<td class='detailitemlabel'>{2}: <span class='" + classDetailScore + "'>{1}</span></td>" +
		"<td class='detailitemvalue'><span class='" + classDetailRank + "'>{3}</span> (+{4})</td>" +
	"</tr>";
var templateCtmlScoreBoardDetailItemWithTies =
		templateCtmlScoreBoardDetailItem.replace(
            "<span class='" + classDetailRank + "'>{3}</span>",
            "{5}-way tie for <span class='" + classDetailRank + "'>{3}</span>");
var templateExpandCollapseImage = "<img src='{0}' title='{1}' />";
var templateArrow = "<img src='{0}' title='{1}' />";
var templateTestSetIdMessage = "Selected test set ID: {0}";
var templateTooFewInningsPitchedMessage = "{0} of {1} required innings pitched.";
var templateUrlPastScores = "http://frozenexports.net/files/projects/ctmlcheese/past scores.json?freshener={0}";
var templateWeekNavListItem = "<li " + attrWeekIndex + "='{0}'>Week {0}</li>";

var typeScript = "script";
var typeUndefined = "undefined";

var timeBaseAnimation = 500;
var timeWaitForLoad = 500;
var timeWatchForRemoval = 500;

var valueDefaultScore = "-";
var valueExtremeHighPitching = 9999;
var valueMatchUpTitleNameDateDivider = ":";
var valueMaxDisplayWeeks = 4;
var valuePitcherType = "P";
var valueOn = "on";

var weekNumberCurrent = defaultWeekNumber;
var weekNumber = defaultWeekNumber;

$(document).ready(function () {
    insertCtmlWeeklyTab();
});

// Called once all standings data has been loaded
function allStandingsLoaded() {
    if (!standingsCurrent) { standingsCurrent = standings; }

    // Loads test data if it is present
    if (typeof testStandingsSets != typeUndefined && testStandingsSets.length > 0) {
        var setIndex = Math.floor(Math.random() * (testStandingsSets.length - 1));
        var testSet = testStandingsSets[setIndex];
        
        console.log(String.format(
            templateTestSetIdMessage,
            testSet.ID
        ));
        standings = testSet.data;
    }

	// Calculates roto scores from loaded statistics
	if(standings.length > 0) {
		for(var teamsProcessed = 0; teamsProcessed < standings.length; teamsProcessed++) {
		    calculateRotoScore(standings[teamsProcessed]);
		}

		insertStandingsList();
		insertNavigationElements();
	}

    insertWeekNavigationElements();

    // Prints standings to console, if requested
	var printOptionVariableValue = getParameterByName(attrShouldPrintScores);
	if (printOptionVariableValue && printOptionVariableValue.length > 0 && 
            printOptionVariableValue.toLowerCase() == valueOn.toLocaleLowerCase()) {
	    console.log(JSON.stringify(standings));
	}

    // Makes tab visible after scores have been loaded
    var scoreBoardContent = $(selectorScoreBoardContentArea);
    var realScoreBoardContent = $(selectorRealScoresContentArea);
    var ctmlWeeklyBoard = $(selectorCtmlScoreBoard);
    var scoreTabsList = $(selectorScoreTabsList);
    if (scoreBoardContent.length> 0 && 
    		ctmlWeeklyBoard.length > 0 && 
    		scoreTabsList.length > 0 &&
    		realScoreBoardContent.length > 0) {
        var scoreTabs = scoreTabsList.children(selectorListItems);
        
        // Adds events to reshow other tabs on click.
        scoreTabs.each(function() { 
        	$(this).click(function() {
        		ctmlWeeklyBoard.hide();
        		
        		if($(this).hasClass(classFirst)) scoreBoardContent.show();
        		if($(this).hasClass(classLast)) realScoreBoardContent.show();
        	});
        });
		
        if (scoreTabs.length > 0) {		
            // Inserts extra tab after first tab and hooks up appropriate events.
            slideIn(scoreTabs.first(), $(templateCtmlWeeklyTab), !isTabExposed, function () {
                isTabExposed = true;
                var ctmlWeeklyTab = $(selectorCtmlWeeklyTab);
                ctmlWeeklyTab.bind("click", false);
                ctmlWeeklyTab.click(function () {
                    disableAllScoreTabs();
                    ctmlWeeklyTab.addClass(classScoreTabSelected);

                    scoreBoardContent.hide();
                    realScoreBoardContent.hide();
                    ctmlWeeklyBoard.show();
					
					// The site will occasionally refresh portions of the page which can make the CTML tab disappear
					// This (hopefully) prevents that
					guardAgainstTabRemoval(timeWatchForRemoval);
                });
            });
        }
    }

}

// Calculates a team's roto score and sets it on the provided item - this could be more efficient by
// processing all teams at once but it would be more confusing and there aren't really that many teams to worry about
function calculateRotoScore(team) {
	if(team && team.scores && standings.length && standings.length > 0) {
		team.rotoScores = new Array();
	
		// Calculates individual rotoscores for each category
		for(var statsProcessed = 0; statsProcessed < scoringCategories.length; statsProcessed++) {
			var rotoScore = new Object();
			rotoScore.category = scoringCategories[statsProcessed].identifier;
			rotoScore.value = 0;
			rotoScore.rank = 1;
			rotoScore.ties = 1;
			
			// Compares this team's scores to all other team's scores
			for(var teamsComparedTo = 0; teamsComparedTo < standings.length; teamsComparedTo++) {
				var teamScore = parseFloat(team.scores[statsProcessed].value);
				if(!teamScore) { teamScore = 0; }
				
				var teamComparingTo = standings[teamsComparedTo];
				var scoreComparingTo = null;
				if(teamComparingTo.scores[statsProcessed] != null) { scoreComparingTo = parseFloat(teamComparingTo.scores[statsProcessed].value); }
				if(!scoreComparingTo) { scoreComparingTo = 0; }

				// 1 point for your own team
				if(team.name == teamComparingTo.name) {
				    rotoScore.value += 1;
				}
				// .5 point for ties
				else if (teamScore == scoreComparingTo) {
					rotoScore.value += .5;
					rotoScore.ties++;
				}
				// 1 points for wins
				else if ((teamScore > scoreComparingTo && scoringCategories[statsProcessed].higherIsBetter) || 
					(teamScore < scoreComparingTo && !scoringCategories[statsProcessed].higherIsBetter)) {
						rotoScore.value += 1;
				}
				// Nothing for losses
				else {
				    rotoScore.rank++;
				}
			}
			
			team.rotoScores.push(rotoScore);
		}
		
		// Calculates overall roto score
		team.rotoScore = 0;
		for(var rotoScoresCombined = 0; rotoScoresCombined < team.rotoScores.length; rotoScoresCombined++) {
			team.rotoScore += team.rotoScores[rotoScoresCombined].value;
		}
	}
}

// Primarily converts arrays-turned-objects back into arrays
function convertJsonStandings(standingsJson) {
    var convertedStandings = new Array();

    for (var weeksProcessed = 0; weeksProcessed < standingsJson.length; weeksProcessed++) {
        var theseStandings = null;

        if (standingsJson[weeksProcessed]) {
            theseStandings = new Array();
            for (var teamsProcessed = 0; teamsProcessed < standingsJson[weeksProcessed].length; teamsProcessed++) {
                var thisTeam = standingsJson[weeksProcessed][teamsProcessed];
                theseStandings.push(thisTeam);
            }
        }

        convertedStandings.push(theseStandings);
    }

    return convertedStandings;
}

function disableAllScoreTabs() {
	$(selectorScoreTabsList).children(selectorListItems).removeClass(classScoreTabSelected);
}

// Watches for the CTML tab to be removed and reinserts it if this is the case. Should only be run
// without an argument if there is an imminent danger of this happening as this will loop VERY quickly and could eat
// a lot of processor resources. If a time is provided, that many milliseconds are delayed between additional 
// checks. Without a check time the looping stops as soon as the tab is reinserted.
function guardAgainstTabRemoval(checkTime) {
	if($(selectorCtmlWeeklyTab).length == 0) { 
		insertCtmlWeeklyTab(); 
		
		if(checkTime) { guardAgainstTabRemoval(checkTime); }
	}
	else { setTimeout(function() { guardAgainstTabRemoval(); }, checkTime? checkTime : 50); }
}

function insertCtmlWeeklyTab() {
	var scoreBoardContent = $(selectorScoreBoardContentArea);
	if(scoreBoardContent.length > 0) {
		// Re-inserts tab if the other tabs are clicked
		$(selectorDefaultScoreTabs).click(function() { guardAgainstTabRemoval() });
		$(selectorWeekSelectLinks).click(function() { guardAgainstTabRemoval() });
	
		// Inserts an empty copy of the current score board to provide a place to display
		// the weekly CTML totals.
		var ctmlWeeklyBoard = scoreBoardContent.clone();
		ctmlWeeklyBoard.html(templateCtmlScoreBoard).attr(attrId, idCtmlScoreBoard).hide();
		scoreBoardContent.parent().append(ctmlWeeklyBoard);
		
		// Loads links to individual team pages
		$(selectorTeamRosterLinks).each(function() {
			if($(this).attr(attrHref) && $(this).text()) {
				teamLinks[$(this).text()] = $(this).attr(attrHref);
			}
		});
		
		// If standings have already been loaded, they do not need to be fetched again.
		if(standings) { allStandingsLoaded(); }
		else { loadCtmlWeeklyBoardContent(ctmlWeeklyBoard); }
		
		// Hides week nav until the needed data is loaded
		$(selectorWeekNav).hide();
	}
}

// Adds navigation elements for all scoring categories and totals
function insertNavigationElements() {
	var navControlsHolder = $(selectorCtmlNavControls);
	if(navControlsHolder.length > 0 && scoringCategories && scoringCategories.length) {
		navControlsHolder.append(String.format(
			templateCtmlNavItem,
			scoringCategories.length + 1,
			descriptionTotals,
			descriptionTotalsIdentifier
		));
		
		// "Selects" totals element
		navControlsHolder.children("#" + (scoringCategories.length + 1)).addClass(classSelected);
		
		for(var categoriesAdded = 0; categoriesAdded < scoringCategories.length; categoriesAdded++) {
			if(scoringCategories[categoriesAdded].identifier) {
				navControlsHolder.append(String.format(
					templateCtmlNavItem,
					categoriesAdded,
					scoringCategories[categoriesAdded].friendlyName,
					scoringCategories[categoriesAdded].identifier
				));
			}
		}
		
		// Attaches click action to navigation buttons
		$(selectorCtmlNavItems).click(function() { navItemClicked($(this)); });
		
		navControlsHolder.append(templateCtmlClearBar);
	}
}

// Removes current list and redisplays it, can be used to show only a specific stat
function insertStandingsList(statIndex) {
    // A specific stat is being requested, so sorts on that stat
    if (statIndex != null && statIndex >= 0 && scoringCategories && statIndex < scoringCategories.length) {
        standings = $(standings).tsort('', { sortFunction: function (a, b) {
            returnValue = 0;

            teamA = a.e[0];
            teamB = b.e[0];

            if (teamA && teamA.scores && teamA.scores.length > statIndex && teamA.scores[statIndex].value != null &&
				teamB && teamB.scores && teamB.scores.length > statIndex && teamB.scores[statIndex].value != null) {

                if (parseFloat(teamA.scores[statIndex].value) > parseFloat(teamB.scores[statIndex].value)) {
                    returnValue = scoringCategories[statIndex].higherIsBetter ? -1 : 1;
                }
                else if (parseFloat(teamB.scores[statIndex].value) > parseFloat(teamA.scores[statIndex].value)) {
                    returnValue = scoringCategories[statIndex].higherIsBetter ? 1 : -1;
                }
                else {
                    // If values are the same, compare names. If those are the same, the teams are equal
                    if (teamA.name > teamB.name) { returnValue = 1; }
                    else if (teamB.name > teamA.name) { returnValue = -1; }
                }
            }

            return returnValue;
        }});
	}
	// No specific stat requested, so simply sorts on the roto score
	else {
		statIndex = scoringCategories.length;
	
		standings = $(standings).tsort('', { sortFunction: function(a,b) {
			returnValue = 0;
			
			teamA = a.e[0];
			teamB = b.e[0];
			
			if(teamA && teamA.rotoScore && teamA.name && teamB && teamB.rotoScore && teamB.name) {
				if(teamA.rotoScore > teamB.rotoScore ) { returnValue = -1; }
				else if (teamB.rotoScore > teamA.rotoScore) { returnValue = 1; }
				else {
					// If rotoscores are the same, compare name, if those are the same, the teams are equal
					if(teamA.name > teamB.name) { returnValue = 1; }
					else if (teamB.name > teamA.name) { returnValue = -1; }
				}
			}
			
			return returnValue;
		}});
	}

	// Clears current list entries
	$(selectorCtmlScoreList).html("");
	
	// Displays sorted list of teams
	var previousTeamScore = 0;
	var previousTeamPosition = 1;
	for(var teamsListed = 0; teamsListed < standings.length; teamsListed++) {
		team = standings[teamsListed];
		
		if(team && team.rotoScore && team.name) {
			previousTeamPosition = statIndex < scoringCategories.length?
				(previousTeamScore == team.scores[statIndex].value? previousTeamPosition : teamsListed + 1) :
				(previousTeamScore == team.rotoScore? previousTeamPosition : teamsListed + 1);
	
			var displayScore = statIndex < scoringCategories.length?
				// If stat index specifies a specific category, display that score. If a formatting function is
				// provided for that category, it is used. Otherwise, he number is displayed.
				(scoringCategories[statIndex].valueFormatFunction? 
					scoringCategories[statIndex].valueFormatFunction(team.scores[statIndex].value) :
					team.scores[statIndex].value
				):
				team.rotoScore;
				
			// Translates high pitching scores to a more friendly display value.
			if(statIndex < scoringCategories.length && !teamMeetsMinInningsPitched(team, statIndex)) {
				displayScore = valueDefaultScore;
			}
	
			var scoreBoardItem = $(String.format(
				templateCtmlScoreBoardItem,
				previousTeamPosition,
				team.name,
				displayScore));
			
			if(statIndex < scoringCategories.length && !teamMeetsMinInningsPitched(team, statIndex)) {
				scoreBoardItem.attr(attrTitle, String.format(
					templateTooFewInningsPitchedMessage,
					team.inningsPitched,
					scoringCategories[statIndex].minInningsPitched));
			}

            // Adds class if this team belongs to "me"
            if(team.isMyTeam) { scoreBoardItem.addClass(classMyTeam); }

			$(selectorCtmlScoreList).append(scoreBoardItem);
			
			// If this is the totals display, populates details table
			if(statIndex >= scoringCategories.length) {
				for(var scoresAdded = 0; scoresAdded < team.rotoScores.length; scoresAdded++) {
					score = team.rotoScores[scoresAdded];
					if (score.category && score.rank && score.ties && score.value && team.scores.length > scoresAdded) {
					    var detailItem = $(String.format(
							score.ties == 1 ? templateCtmlScoreBoardDetailItem : templateCtmlScoreBoardDetailItemWithTies,
							scoringCategories[scoresAdded].friendlyName,
							teamMeetsMinInningsPitched(team, scoresAdded)? 
								(scoringCategories[scoresAdded].valueFormatFunction ?
									scoringCategories[scoresAdded].valueFormatFunction(team.scores[scoresAdded].value) :
								valueDefaultScore,
									team.scores[scoresAdded].value) : valueDefaultScore,
							score.category,
							getOrdinal(score.rank),
							score.value,
							score.ties));

                        // Marks best 1/3 of ranks as "good" and worst 1/3 as "bad", leaving the remaining as neutral.
					    var splitRank = Math.floor(standings.length / 3);
					    if (score.rank <= splitRank) { detailItem.find(selectorDetailHighlights).addClass(classKpiGood); }
					    if (score.rank > standings.length - splitRank) { detailItem.find(selectorDetailHighlights).addClass(classKpiBad); }

					    scoreBoardItem.find(selectorTeamDetails).append(detailItem);
					}
				}
			}
			
			previousTeamScore = statIndex < scoringCategories.length? team.scores[statIndex].value : team.rotoScore;
		}
	}
	
	// If this is the overall category, shows detail buttons
	if (statIndex == scoringCategories.length) {
	    $(selectorDetailsControls).html(String.format(
			templateExpandCollapseImage,
			imageSrcDetailsExpand,
			descriptionExpandScoringDetails
			));
	    $(selectorDetailsControls).click(function () { toggleDetailState($(this)) });
	}
	// If not, hides detail button
	else {
	    $(selectorDetailsControls).hide();
    }

	$(selectorCtmlDisplayDescription).html(statIndex < scoringCategories.length ? scoringCategories[statIndex].friendlyName : descriptionTotals);
}

function insertWeekNavigationElements() {
    $(selectorWeekNavContainer).css({ opacity: 0 });
    $.getJSON(String.format(templateUrlPastScores, (new Date()).toString()), function (data) {
        pastScores = convertJsonStandings(data);

        // Marks "my team" for old stats
        for (var weeksInspected = 1; weeksInspected < pastScores.length; weeksInspected++) {
            for (var teamsInspected = 0; teamsInspected < pastScores[weeksInspected].length; teamsInspected++) {
                var thisTeam = pastScores[weeksInspected][teamsInspected];
                if (thisTeam.name == myTeamName) {
                    thisTeam.isMyTeam = true;
                    break;
                }
            }
        }

        // Waits for current stats to be loaded
        var weekDataLoadLoop = setInterval(function () {
            if (weekNumber != defaultWeekNumber) {
                clearInterval(weekDataLoadLoop);

                pastScores[weekNumberCurrent] = standingsCurrent;

                for (var weeksAdded = 1; weeksAdded <= weekNumberCurrent; weeksAdded++) {
                    var weekNavItem = $(String.format(templateWeekNavListItem, weeksAdded));
                    $(selectorWeekNav).append(weekNavItem);
					
					if (weeksAdded == 1) {
						weekNavItem.addClass(classFirst);
					}

                    if (weeksAdded == weekNumber) {
                        weekNavItem.addClass(classSelected);
                    }

                    if (weeksAdded == weekNumberCurrent) {
                        weekNavItem.addClass(classLast);
                    }

                    weekNavItem.click(function () { selectWeek($(this)) });
                }

                // Scrolls to show current week and sets up scroll events if needed.
                moveWeekNav(weekNumber, false);

                $(selectorWeekNavPrev).append(String.format(templateArrow, imageSrcPreviousArrow, descriptionPrevious));
                $(selectorWeekNavNext).append(String.format(templateArrow, imageSrcNextArrow, descriptionNext));

                $(selectorWeekNavContainer).animate({ opacity: 1 }, timeBaseAnimation);
            }
        }, timeWaitForLoad);
    });
}

// Asynchronously retrieves and inserts content needed to populate CTML weekly board.
function loadCtmlWeeklyBoardContent(ctmlWeeklyBoard) {
	standings = new Array();
	if(ctmlWeeklyBoard && ctmlWeeklyBoard.length && ctmlWeeklyBoard.length > 0) {
	    var matchUpLinks = $(selectorMatchUpLinks);
	    var myTeamFound = false;
	    var myTeamLink = $(selectorMyTeamLink);
	    if (myTeamLink.length > 0) { myTeamName = myTeamLink.text(); }
		
		// Retrieves statistics from each match up
	    matchUpLinks.each(function () {
	        if ($(this).attr(attrHref) && $(this).attr(attrHref).length > 0) {
	            $.get($(this).attr(attrHref), function (data) {
	                if (data) {	                
						// Loads the week number
						if(weekNumber == defaultWeekNumber) {
							var weekTitleHolder = $(data).find(selectorMatchUpTitle);
							var dividerIndex = weekTitleHolder.text().indexOf(valueMatchUpTitleNameDateDivider);
							if(weekTitleHolder.length > 0 && dividerIndex > -1) {
							    weekNumber = parseInt(weekTitleHolder.text().substring(0, dividerIndex).match(/\d+/)[0]);
                                weekNumberCurrent = weekNumber;
							}
						}
					
	                    // Inspects both team rows for this match up
	                    var teamRows = $(data).find(selectorTeamRows);
	                    if (teamRows.length > 0) {
	                        teamRows.each(function () {
	                            var team = new Object();
								team.inningsPitched = 0;
	                            team.isMyTeam = false;
	                            team.name = $(this).find(selectorTeamRowNameHolder).text();
	                            team.scores = new Array();

	                            // Retrieves the value of score from this team
	                            var scoreCounter = 0;
	                            $(this).find(selectorTeamRowStatHolders).each(function () {
	                                var value = $(this).text();
	                                if (value == emptyScoreValue) { value = 0; }
	                                // Removes any asterisks if they are present in the score (such as the case of 
	                                // a "tie" on the scoreboard which isn't really a tie due to rounding)
	                                if (value.toString().indexOf(indicatorPsuedoTie) > -1) {
	                                    value = value.toString().replace(regExAllPseudoTieIndicators, '');
	                                }

	                                setScore(team, scoringCategories, scoreCounter, value);

	                                scoreCounter++;
	                            });

	                            // If this is the first time that a team matching "my team"'s name is found,
	                            // marks this time as the owner's team.
	                            if (!myTeamFound && myTeamName) {
	                                var teamLink = $(this).find(selectorTeamLink);
	                                if (teamLink.length > 0 && teamLink.html() == myTeamName) {
	                                    team.isMyTeam = true;
	                                }
	                            }
								
								// Loads team's roster page to check for innings pitched
								if(teamLinks[team.name]) {
									/*$.get("http://baseball.fantasysports.yahoo.com/b1/117714/1", function (teamRosterPage) {
										if(team.name == "Liars or Crybabies") {
											console.log(teamRosterPage);
										}
										if(teamRosterPage && teamRosterPage.content) {		
											var pitcherStatContainer = null;
											for(var itemsChecked = 0; itemsChecked < $(teamRosterPage.content).length; itemsChecked++) {
												var returnedSection = $($(teamRosterPage.content)[itemsChecked]);
												if(returnedSection.attr(attrDataPosType) == valuePitcherType) {
													pitcherStatContainer = returnedSection.find(selectorInningsPitchedContainer);
													break;
												}
											}
											
											if(pitcherStatContainer) {
												team.inningsPitched = parseFloat(pitcherStatContainer.text());
												if(!team.inningsPitched) { team.inningsPitched = 0; }*/
												
												// Temporary fix until all days (not just the first) are being checked.
												team.inningsPitched = 20;
												
												// Checks all categories for innings pitched requirements
												for(var categoriesChecked = 0; categoriesChecked < scoringCategories.length; categoriesChecked++) {
													if(!teamMeetsMinInningsPitched(team, categoriesChecked)) {
														team.scores[categoriesChecked].value = valueExtremeHighPitching;
													}
												}
											// }
										
											standings.push(team);

											// Checks to see if all have been loaded, since JS is non-threaded
											// there is no need to worry about race conditions
											if (standings.length == matchUpLinks.length * 2) {
												allStandingsLoaded();
											}
										// }
									// });
								};
	                        });
	                    }
	                }
	            });
	        }
	    });
	}
}

function moveWeekNav(moveWeekNumbers, shouldAnimate) {
	var weekNavItems = $(selectorWeekNav).find(selectorListItems);
	if(weekNavItems.length > 0) {
		/* 	Set by hand since dynamic sizing doesn't appear to work consistently. 
			Used previously: weekNavItems.first().outerWidth(); */
		var weekNavItemWidth = 60.25
		var maxItemsDisplayed = 269;
		var currentOffset = parseInt(weekNavItems.first().css(attrLeft));
		var currentFirstItem = (currentOffset * -1) / weekNavItemWidth + 1;
		var currentLastItem = currentFirstItem + maxItemsDisplayed - 1;
		
		var weeksToMove = 0;
		// Calculates for right shift
		if(moveWeekNumbers > 0) {		
			weeksToMove = moveWeekNumbers + currentLastItem <= weekNavItems.length?
				moveWeekNumbers : weekNavItems.length - currentLastItem;
		}
		// Calculates for left shift
		if(moveWeekNumbers < 0) {
			weeksToMove = currentFirstItem + moveWeekNumbers <= 1?
				1 - currentFirstItem : moveWeekNumbers;
		}
		
		// Enables/disables buttons
		$(selectorWeekNavPrev).unbind("click").addClass(classDisabled);
		$(selectorWeekNavNext).unbind("click").addClass(classDisabled);	
		// Only allows scrolling if there are more items than can be displayed.
		if(currentLastItem < weekNavItems.length || currentFirstItem > 1) {	
			currentFirstItem += weeksToMove;
			currentLastItem += weeksToMove;
		
			if(currentFirstItem != 1) { 
				$(selectorWeekNavPrev).click( function() { moveWeekNav(-2, true); }).removeClass(classDisabled); 
			}
			if(currentLastItem != weekNavItems.length) { 
				$(selectorWeekNavNext).click( function() { moveWeekNav(2, true); }).removeClass(classDisabled); 
			}
			
			weekNavItems.animate({
				left: currentOffset + (weeksToMove * weekNavItemWidth * -1)},
				shouldAnimate? timeBaseAnimation : 0);
		}
	}
}

// Fired when a navigation button is clicked.
function navItemClicked(item) {
	if(item && item.length && item.length > 0 && !item.hasClass(classSelected) && item.attr(attrId)) {
		$(selectorCtmlNavItemSelected).removeClass(classSelected);
		item.addClass(classSelected);
		insertStandingsList(item.attr(attrId));
	}
}

// Changes stats to a specific week
function selectWeek(weekContainer) {
    if (weekContainer && weekContainer.length > 0) {
        $(selectorWeekNav).find(selectorListItems).removeClass(classSelected);

        var selectedWeekIndex = weekContainer.attr(attrWeekIndex);
        weekNumber = selectedWeekIndex;
        standings = pastScores[weekNumber];
        weekContainer.addClass(classSelected);

        // Displays particular scoring category if it is already selected
        var selectedScoringCategoryId = $(selectorCtmlNavItemSelected).attr(attrId);

        insertStandingsList(selectedScoringCategoryId);
    }
}

// Locates the requested category in the provided team and (if it exists)
// sets the provided value.
function setScore(team, categories, index, value) {
	if(team && team.scores && categories && index != null && value != null && categories.length > index) {
		var score = { category: categories[index].identifier, value: value };
		team.scores.push(score);
	}
}

// Increases an element's width from zero and slides it in. Note that if the element is already visible this
// will look odd.
function slideIn(elementToFollow, element, shouldAnimate, followup) {
	if(elementToFollow && elementToFollow.length && elementToFollow.length > 0 &&
		element && element.length && element.length > 0) {
			// Temporarily inserts element at full width to get actual width and
			// then sets its initial width to 0 and hides all overflow
			elementToFollow.after(element);
			var width = element.width();
			element.css(styleExpandingElement);
			
			element.animate({
					width: width
				},
				shouldAnimate? timeBaseAnimation : 0,
				function() { 
					element.animate({opacity: 1}, shouldAnimate? timeBaseAnimation : 0);
					if(followup) { followup() }; 
				
				}
			);
	}
}

// Checks to see if the provided scoring category has a minimum pitched innings requirement and
// if it does checks to see if hte team has met this requirement
function teamMeetsMinInningsPitched(team, categoryIndex) {
	var returnValue = true;
	
	if(scoringCategories && scoringCategories.length >= categoryIndex &&
		scoringCategories[categoryIndex].minInningsPitched) {
			returnValue = team.inningsPitched >= scoringCategories[categoryIndex].minInningsPitched;
		}
		
	return returnValue;
}

// Expands or contracts the details area for the requested button.
function toggleDetailState(clickedButton) {
	if(clickedButton && clickedButton.length > 0) {			
		var listItem = clickedButton.parents(selectorListItems);
		if(listItem.length > 0) {
			var isExpanding;
			var details = listItem.first().find(selectorVisibleTeamDetails);
			// Details are expanded so collapses them.
			if (details.length > 0) {
				isExpanding = false;
				
				details.animate({
					opacity: 0},
					timeBaseAnimation,
					function () {
						// Rehighlights on collapse if needed
						if(listItem.first().hasClass(classMyTeam)) {
							listItem.first().find(selectorTeamSummary).animate({
								backgroundColor: colorHighlitSummaryBackgroundColor},
								timeBaseAnimation
							);
						}
					
						listItem.first().css(styleDefaultHeight);
						details.hide();
						var targetHeight = listItem.first().height();
						details.show();
						listItem.first().animate({
							height: targetHeight},
							timeBaseAnimation,
							function() {
								details.hide();
							});
					});
			}
			// Details are collapsed so expands them
			else {
				isExpanding = true;
			
				details = listItem.first().find(selectorTeamDetails);
				if (details.length > 0) {
					listItem.first().css(styleDefaultHeight);
					details.show();
					var targetHeight = listItem.first().height();
					details.hide();
					listItem.first().animate({
						height: targetHeight},
						timeBaseAnimation,
						function() {
							details.css({opacity: 0});
							details.show();
							details.animate({
								opacity: 1},
								timeBaseAnimation);
						});
						
					// Row will be highlighted, so fades out highlighting on expansion.
					if(listItem.first().hasClass(classMyTeam)) {
						var summary = listItem.first().find(selectorTeamSummary);
						colorHighlitSummaryBackgroundColor = summary.css(attrBackgroundColor);
						listItem.find(selectorTeamSummary).animate({
							backgroundColor: colorDefaultSummaryBackgroundColor },
							timeBaseAnimation);
					}
				}
			}
		
			clickedButton.fadeOut(timeBaseAnimation, function() {
				clickedButton.html(String.format(
					templateExpandCollapseImage,
					isExpanding? imageSrcDetailsCollapse : imageSrcDetailsExpand,
					isExpanding? descriptionCollapseScoringDetails : descriptionExpandScoringDetails
				));
				clickedButton.fadeIn(timeBaseAnimation);
			});
		}
	}
	
}

// Duplication of C# string.format - stolen: (http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery)
String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {       
    var reg = new RegExp("\\{" + i + "\\}", "gm");             
    s = s.replace(reg, arguments[i + 1]);
  }

  return s;
}

// Shamelessly copied from the Internet (http://forums.shopify.com/categories/2/posts/29259)
function getOrdinal(n) {
   var s=["th","st","nd","rd"],
       v=n%100;
   return n+(s[(v-20)%10]||s[v]||s[0]);
}

// Shamelessly copied from the Internet (http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript)
function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}