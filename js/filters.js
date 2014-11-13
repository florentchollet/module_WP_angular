var filt = angular.module('filters', []);


// CLEAN ARRAY
// -------------------------------------------------

var cleanArray = function(input) {
	// Vars
	var list = [], currentId = '', out = [];

	// Sets all id in an array and sorts it by id
	for (var i=0; i<input.length; i++) {
		list.push(input[i].id);
	}
	list = list.sort();

	// Loops on the new sort list
	// If the current id == the previous one, deletes it
	for (var i=0; i<list.length; i++) {
		if (list[i] == currentId) {
			list.splice(i, 1);	
		}
		currentId = list[i];		
	}

	// Sets all the new objects list into an array
	for (var i=0; i<list.length; i++) {
		out.push(input[i]);
	}

	// Returns the final list
	return out;

};



// REGEX
// -------------------------------------------------

// Gets all the data that match the regex
// field : the json key
// regex : the expression you want to looking for

filt.filter('regex', function() {
	return function( input, field, regex ) {

		// If there is a regex to check
		if (regex != false && regex != null) {

			// vars			
			var out = [];				
			
			// If regex is an object loops on it and sets the number of regex
			if (typeof regex == 'object') {
				var reg = [];	
				for (var i=0; i<regex.length; i++){	
					reg = new RegExp("\^" + regex[i]);
					testReg(input, field, reg, out);
				}

			// Otherwise loops on the regex
			} else {
				var reg = new RegExp("\^" + regex);	
				testReg(input, field, reg, out);							
			}
			return cleanArray(out);

		// Otherwise return the input
		} else {
			return input;
		}
	}
});

// Function : test the regex and sets the out array
var testReg = function(input, field, reg, out) {

	// Loops on the input array
	for (var k=0; k<input.length; k++){

		// If the field is an object loops on it
		// and tests the regex on the slug 
		if (typeof input[k][field] === 'object') {
			for (var l=0; l<input[k][field].length; l++ ) {
				if ( reg.test(input[k][field][l].slug) ) {
					out.push(input[k]);
				}
			}

		// Otherwise test the string
		} else {
			if ( reg.test(input[k][field]) ) {
				out.push(input[k]);
			}
		}	
	}
};