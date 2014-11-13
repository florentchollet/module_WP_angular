var mnlt, noticesCtrl, noticesFactory;

mnlt = angular.module("mnlt", ['filters', 'directives', 'ngSanitize']);

//Url pour récupérer API JSON et templates
var baseurl = 'http://www.museeprotestant.org';

// config
mnlt.config(function($httpProvider) {
	delete $httpProvider.defaults.headers.common["X-Requested-With"];
});


// noticesCtrl
mnlt.controller("noticesCtrl", noticesCtrl = function($scope, $http, $sce, $timeout) {

	
	// VARS
    // -------------------------------------------------
	//var sep = '\n------------------------------------------------';


	// FUNCTIONS
    // -------------------------------------------------
    
    // localStorage Obj
	Storage.prototype.setObj = function(key, obj) {
    	return this.setItem(key, JSON.stringify(obj))
	}
	Storage.prototype.getObj = function(key) {
	    return JSON.parse(this.getItem(key))
	}

	

	// CLEAR LOCALSTORAGE EACH DAY
    // -------------------------------------------------

	var d = new Date();
	var day = d.getDay();
	var month = d.getMonth();
	var year = d.getFullYear();
	var sp = "/";
	var date = day + sp + month + sp + year;

	// Seting the current date and clear the localStorage
	if ( localStorage.getItem('date') != date ) {

		// Clear local
		localStorage.clear();
		//console.log("LOCALSTORAGE CLEARED");

		// Set date
		localStorage.setItem('date', date);	
		//console.log("SETING DATE LOCALSTORAGE : " + date + sep);

	// Otherwise get  the current localStorage date
	} else {
		//console.log("GETING DATE LOCALSTORAGE : " + date + sep);
	}



	// TEMPLATES + BASE SETTINGS
    // -------------------------------------------------

    // Sets the default lang
	$scope.currentLang = '';
	$scope.langN = 'fr';	

	$scope.templates = {
		fr : [
			{ name: 'grandes dates', slug: 'grandes-dates', url: baseurl + '/monolithe/templates/grandes-dates.html'},
			{ name: 'histoire', slug: 'histoire', url: baseurl + '/monolithe/templates/histoire.html'},
			{ name: 'personnalités', slug: 'personnalites', url: baseurl + '/monolithe/templates/personnalites.html'},
			{ name: 'thèmes', slug: 'themes', url: baseurl + '/monolithe/templates/themes.html'},
			{ name: 'art - patrimoine', slug: 'art-patrimoine', url: baseurl + '/monolithe/templates/art-patrimoine.html'}
		],
		en : [
			{ name: 'major dates', slug: 'significant-dates', url: baseurl + '/monolithe/templates/grandes-dates.html'},
			{ name: 'history', slug: 'history', url: baseurl + '/monolithe/templates/histoire.html'},
			{ name: 'key figures', slug: 'personnalities', url: baseurl +  '/monolithe/templates/personnalites.html'},
			{ name: 'themes', slug: 'themes-en', url: baseurl + '/monolithe/templates/themes.html'},
			{ name: 'art - heritage', slug: 'art-heritage', url: baseurl + '/monolithe/templates/art-patrimoine.html'}
		],
		de : [
			{ name: 'eckdaten', slug: 'wichtige-daten', url: baseurl + '/monolithe/templates/grandes-dates.html'},
			{ name: 'geschichte', slug: 'geschichte', url: baseurl + '/monolithe/templates/histoire.html'},
			{ name: 'persönlichkeiten', slug: 'personlichkeiten', url: baseurl + '/monolithe/templates/personnalites.html'},
			{ name: 'themen', slug: 'themen', url: baseurl + '/monolithe/templates/themes.html'},
			{ name: 'kunst und erbe', slug: 'kunst-kulturerbe', url: baseurl + '/monolithe/templates/art-patrimoine.html'}
		]
	};	

	// Sets the default template
	$scope.currentParam = 1;
	$scope.template = $scope.templates[$scope.langN][$scope.currentParam];

	// Addclass Active on menu template
	$scope.isActive = function(item) {
      if (item.slug == $scope.template.slug) {
        return true;
      }
      return false;
    };

	// Changes the template
	$scope.getTemplate = function(param, lang) {
		$scope.currentParam = param;		
		$scope.template = $scope.templates[$scope.langN][param];	
	};

	// Changes lang //Add class lang on template
	$scope.getLang = function(lang) {
		if (lang.slice(1,3) == '') {
			$scope.langN = 'fr';
			$scope.classlang = "lang-fr";
		} else {
			$scope.langN = lang.slice(1,3);
			$scope.classlang = "lang-"+lang.slice(1,3);
		}
		$scope.currentLang = lang;
	};



	// NOTICES
    // -------------------------------------------------

	// Function : Gets the wordpress json for notices
	$scope.getNotices = function(name, lang) {	

		$(".loader").css({"display":"block"});	

		// Clear notices		
		$scope.bullets = [];
		$scope.notices = [];	


		// If a localStorage for the name exists
		if (localStorage.getItem(name+lang.slice(1,3)) != null && typeof localStorage != undefined) {				

			//console.log( 'GETING THE LOCALSTORAGE FOR : ' + name + ' AND LANG : ' + lang.slice(1,3) + sep);			

			// Gets the notices in localStorage
			$scope.notices = localStorage.getObj(name+lang.slice(1,3));

			$(".loader").css({"display":"none"});
			// Shows the template with a timeout before !important
			$timeout( function() { $(".templates").fadeIn() }, 200 );


	    // Otherwise gets the json and sets a localStorage for it
	    } else {		

	    	//console.log('SETING THE LOCALSTORAGE FOR : ' + name + ' AND LANG : ' + lang.slice(1,3) + sep);  		    	

    		// Gets the wordpress json 
	        $http.jsonp( baseurl + lang + "/api/get_posts/?post_type=notice&rubriques=" + name + "&custom_fields=none&count=-1&callback=JSON_CALLBACK").success(function(data, status) {			        	        	

				// Returns all the json data
				if ( data.count != 0 ) {

					//console.log('LOCALSTORAGE DONE' + sep);

					$(".loader").css({"display":"none"});
					// Shows the templates with a fadin
					$(".templates").fadeIn();

					// Sets notices and localStorage
    				localStorage.setObj(name+lang.slice(1,3), data.posts);
					$scope.notices = data.posts;				

				} else {

					//console.log('NO NOTICES WITHIN : ' + name + sep);
					$scope.notices = "";		

				}								    			    							

			});		    		

    	}

	    // Returns the current category and language
		$scope.currentCat = name;
		$scope.currentLang = lang;	    				    		
        
    };

    // Watch : Gets the correct JSON when slug or lang change
    	$scope.$watchCollection('[template.slug, currentLang]', function() {
    	$scope.template = $scope.templates[$scope.langN][$scope.currentParam];
    	$scope.getNotices($scope.template.slug, $scope.currentLang);
	});	


	// ALPHABET
    // -------------------------------------------------

	$scope.alphabet = [
		'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
	];
	$scope.getLetter = function(input) {
		$scope.letter = input;
	};

	//Traductions filters
	$scope.getTrad = function(lang) {
		//console.log(sep + lang.slice(1,3) + sep);
		if(lang.slice(1,3) == 'en'){
			$scope.filtername = "By name: ";
			$scope.filtersiecle = "By centuries: ";
			$scope.namesearch = "search";
			$scope.tradall = "all";
		}
		if(lang.slice(1,3) == 'de'){
			$scope.filtername = "Nach namen : ";
			$scope.filtersiecle = "Nach Jahrhunderten : ";
			$scope.namesearch = "suche";
			$scope.tradall = "alle";
		}
		if(lang.slice(1,3) == '' ){
			$scope.filtername = "par nom : ";
			$scope.filtersiecle = "par siècles : ";
			$scope.namesearch = "rechercher";
			$scope.tradall = "tous";
		}
	}
	 $scope.$watch('currentLang', function() {
		$scope.getTrad($scope.currentLang);
	});


	// Highlights selected letter
	$scope.$watch('letter', function() {	
		// Resets colors		
		$('.filter-alphabet li').removeClass("activeLetter");
		$('.resetLetter').css({"opacity":"0"})	
		// Colors selected letter
		if ($scope.letter != null && $scope.letter != undefined && $scope.letter != '') {
			$('.filter-alphabet li:contains("' + $scope.letter + '")').addClass("activeLetter");
			$('.resetLetter').css({"opacity":"1"});
		}
	});	
	
	



	// CENTURIES
    // -------------------------------------------------

	// Function : Gets the wordpress json for Centuries
	$scope.getCenturies = function(lang) {   

		//console.log('GETING CENTURIES' + sep);

        $http.jsonp( baseurl + lang + "/api/taxonomy/get_taxonomy_index/?taxonomy=siecles&callback=JSON_CALLBACK").success(function(data, status) {			        	        	
        	var centuries = [];
        	for (var i=0; i<data.terms.length; i++) {
        		centuries.push(data.terms[i]);
        	}        	
        	//console.log('CENTURIES DONE' + sep);
        	$scope.centuriesList = centuries;        	
        });
    };
    $scope.$watch('currentLang', function() {
    	$scope.getCenturies($scope.currentLang);
    });



	// THEMES
    // -------------------------------------------------

	// Function : Gets the wordpress json for Themes
	$scope.getThemes = function(name, lang) { 	
        $http.jsonp( baseurl + lang + "/api/taxonomy/get_taxonomy_index/?taxonomy=" + name + "&callback=JSON_CALLBACK").success(function(data, status) {			        	        	
        	var themes = [];        	
        	for (var i=0; i<data.terms.length; i++) {
        		themes.push(data.terms[i]);
        	}
        	$scope.themesList = themes;        	        	
        });
    };

    $scope.$watchCollection('[template.slug, currentLang]', function() {
    	$scope.themesList = $scope.getThemes($scope.templates['fr'][$scope.currentParam].slug, $scope.currentLang);
	});	   



    // PAGINATION
    // -------------------------------------------------

    // Function : Adds a pagination with a limit per page
	genPagination = function(limit, data) {

		var pages =  Math.ceil(data.length / $scope.limit);		
		
		if (pages) {

			$scope.bullets = [];

			for(var i=1; i<=pages; i++) {  
				// If last page set the modulo   
				var lastCount = data.length % $scope.limit;

       			if (i == pages && lastCount != 0) {        				
					$scope.bullets.push(data.length % $scope.limit);       				
       			// Otherwise set the limit base number
       			} else {
       				$scope.bullets.push($scope.limit); 
       			}
     		}
		}
	};	
	

	// Watch : Sets the templates limit pagination //resize selon hauteur écran -> ne marche qu'en local pas en iframe
	$scope.$watch('template', function() {
		switch ($scope.template.slug) {
			
			case "histoire" :
			case "history" :
			case "geschichte" :				
				if(window.innerHeight < 800 ){
					$scope.limit = 6;	
				}else{
					$scope.limit = 9;
				}							
				break;
			
			case "personnalites" :
			case "personnalities" :
			case "personlichkeiten" :
					$scope.limit = 8;	
				break;
			
			case "themes" :
			case "themes-en" :
			case "themen" :
				if(window.innerHeight < 800 ){
					$scope.limit = 4;	
				}else{
					$scope.limit = 6;
				}		
				break;
			
			case "art-patrimoine" :
			case "art-heritage" :
			case "kunst-kulturerbe" :
				if(window.innerHeight < 800 ){
					$scope.limit = 4;	
				}else{
					$scope.limit = 6;
				}		
				break;
		}
	});	

    // Function : Changes the offset and limit pagination
    $scope.pager = function(num, limit) {
    	$scope.pageIndex = num;
    	$scope.pageLimit = -(limit);
    };

    // Page selected
    $scope.pagSelected = 0;
  
	$scope.pagClicked = function ($index) {
		$scope.pagSelected = $index;
	}



    // RESETS
    // -------------------------------------------------
    // Global reset
    $scope.reset = function() {
    	$scope.pager($scope.limit, $scope.limit);
    	$scope.search = '';
    	$scope.letter = false;
    	$scope.century = false;
    	$scope.cursorValues = false;
    	$scope.pagSelected = 0;
    };


    // Reset : pagination, filters
    $scope.$watchCollection('[currentCat, currentLang]', function() {
    	$scope.reset();
	});


	// Watch : Changes the pagination when filtering
	$scope.$watchCollection('[filtered.length, currentLang, template.slug]', function() {
		
		// If filtered exist
		if ($scope.filtered != undefined && $scope.filtered != null) {

			$scope.pagSelected = 0;
			$scope.pager($scope.limit, $scope.limit);	
			genPagination($scope.limit, $scope.filtered);
			
			//si pas de résultat alors on masque la pagination
			if($scope.bullets.length == 1){
				$('.pagination').hide();			
			}else{
				$('.pagination').show();
			}		
		}

	});



	// URL LANG
    // -------------------------------------------------

    $timeout( function() {

	    var currentUrl = window.parent.location.href;

	    var regEn = /\/en\//;
	    var regDe = /\/de\//;

		if (regEn.test(currentUrl)) {
			$scope.getLang("/en");	
		} else if (regDe.test(currentUrl)) {
			$scope.getLang("/de");	
		} else {
			$scope.getLang("");	
		}

	}, 200 );




});
