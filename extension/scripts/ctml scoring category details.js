var scoringCategories = new Array(
	{ identifier: "R", friendlyName: "Runs", higherIsBetter: true },
	{ identifier: "HR", friendlyName: "Dingers", higherIsBetter: true },
	{ identifier: "RBI", friendlyName: "Runs Batted In", higherIsBetter: true },
	{ identifier: "SB", friendlyName: "Stolen Bases", higherIsBetter: true },
	{ identifier: "AVG", friendlyName: "Batting Average", higherIsBetter: true, valueFormatFunction: function (number) {
	    var value = parseFloat(number).toFixed(3);
	    if (value.indexOf("0") == 0 && value.length > 1) {
	        value = value.substring(1);
	    }

	    return value;
	}},
	{ identifier: "W", friendlyName: "Wins", higherIsBetter: true },
	{ identifier: "SV", friendlyName: "Saves", higherIsBetter: true },
	{ identifier: "K", friendlyName: "Strikeouts", higherIsBetter: true },
	{ identifier: "ERA", friendlyName: "Earned Run Average", higherIsBetter: false, minInningsPitched: 7,
		valueFormatFunction: function (number) {
			return parseFloat(number).toFixed(2);
		}
	},
	{ identifier: "WHIP", friendlyName: "Walks & Hits per Inning Pitched", higherIsBetter: false, minInningsPitched: 7, 
		valueFormatFunction: function (number) { 
			return parseFloat(number).toFixed(2); 
		} 
	}
);