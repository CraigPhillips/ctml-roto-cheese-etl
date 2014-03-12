/*
	Information about how scoring categories in Yahoo fantasy baseball behaves and should be displayed.
*/
var scoringCategories = {
	"R": {
		higherIsBetter: true,
		toNumeric: toScoreInt
	},
	"HR": {
		higherIsBetter: true,
		toNumeric: toScoreInt
	},
	RBI: {
		higherIsBetter: true,
		toNumeric: toScoreInt
	},
	SB: {
		higherIsBetter: true,
		toNumeric: toScoreInt
	},
	AVG: {
		higherIsBetter: true,
		toNumeric: toScoreFloat3
	},
	W: {
		higherIsBetter: true,
		toNumeric: toScoreInt
	},
	SV: {
		higherIsBetter: true,
		toNumeric: toScoreInt
	},
	K: {
		higherIsBetter: true,
		toNumeric: toScoreInt
	},
	ERA: {
		higherIsBetter: false,
		toNumeric: toScoreFloat2
	},
	WHIP: {
		higherIsBetter: false,
		toNumeric: toScoreFloat2
	}
};

function toScoreInt(input) {
	var returnValue = 
		input == "-" ? 
			0 : parseInt(input.replace("*", ""));
			
	return returnValue;
}

function toScoreFloat2(input) {
	var returnValue =
		input == "-" ?
			0 : parseFloat(input.replace("*", "")).toFixed(2);
			
	return returnValue;
}

function toScoreFloat3(input) {
	var returnValue =
		input == "-" ?
			0 : parseFloat(input.replace("*", "")).toFixed(3);
			
	return returnValue;
}
