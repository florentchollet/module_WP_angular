var direct = angular.module('directives', []);


// CURSOR DIRECTIVES
// -------------------------------------------------
direct.directive('cursor', function() {		
	return {
		
		restrict: 'E',
		template: '<div id="slider"></div><div class="legend"></div>',
		controller: function($scope, $timeout) {	
			
			$scope.$watch('centuriesList', function() {	

				// If centuriesList exist
				if ($scope.centuriesList != undefined && $scope.centuriesList != null) {

					// Gets the centuries list
					var centuriesList = $scope.centuriesList;							


					// Gets the cursors values
					var getCenturies = function(min, max) {
						// Init out
						var out = [];								
						// Gets all the centuries between the cursors
						for (var i=0; i<centuriesList.length; i++) {
							if (i>=min && i<=max) {
								out.push(centuriesList[i].slug);						
							}
						}				
						// Apply the new centuries list
						$scope.$apply(function() {
							$scope.cursorValues = out;
						});
					};		


					// Sets the jquery-ui slider
					$("#slider").slider({
						range: true,
						min: 0,
						max: centuriesList.length-1,
						values: [0, centuriesList.length-1],
						slide: function(event, ui) {					
							getCenturies(ui.values[0], ui.values[1]);
						}				
					});

					$timeout ( function() {
						// Displays the centuries along the slider
						var cursorW = $(".legend").width();

						// Appends the centuries
						$(".legend").empty();
						for (var i=0; i<centuriesList.length; i++) {
							var reg = new RegExp("e siècle");							
							//$(".legend").append("<span>" + centuriesList[i].title.split(reg)[0] + " <sup>ème</sup></span>");
							$(".legend").append("<span>" + centuriesList[i].title.split(reg)[0] + "</span>");
						}

						// Sets each century in percent					
						$(".legend span").each(function(index) {
							var centuryW = ($(this).width() / 2) / cursorW * 100;
							var posX = (100 * (cursorW / (centuriesList.length - 1)) / cursorW) * index - centuryW;
							$(this).css({"left": posX + "%"});				
						});
					}, 300 );

				}

			});	

		}
	};
});



// SIDE MENU
// -------------------------------------------------
direct.directive('sidemenu', function() {		
	return {		
		restrict: 'E',
		template: '<div class="filters"><ul class="menu-themes"></ul></div>',
		controller: function($scope, $compile) {			
			
			$scope.$watch('themesList', function() {	

				var themesList = [],
					themes = [];				

				// If themeslist exist
				if ($scope.themesList != undefined && $scope.themesList != null) {
			
					// Gets the centuries list
					themesList = $scope.themesList;

					// Init themes array
					themes = [];

					$(".menu-themes li").remove();
					
					// Sets themes parents within the template
					for (var i=0; i<themesList.length; i++) {
						if (themesList[i].parent == 0) {
							themes.push(themesList[i]);						
							document.querySelectorAll(".menu-themes")[0].innerHTML += "<li><a title='" + themesList[i].title + "' ng-click=" + "getLetter('" + themesList[i].slug + "')" + ">" + themesList[i].title + "</a></li>";								
						}
					}

					// Sets themes Children within parents ul
					// and compile it
					for (var i=0; i<themes.length; i++) {		
						document.querySelectorAll(".menu-themes > li")[i].innerHTML += "<ul class='submenu'></ul>";			
						for (var j=0; j<themesList.length; j++) {										
							if (themesList[j].parent == themes[i].id) {
								document.querySelectorAll(".menu-themes > li .submenu")[i].innerHTML += "<li><a id='" + themesList[j].slug + "' ng-click=" + "getLetter('" + themesList[j].slug + "')" + ">" + themesList[j].title + "</a></li>";								
								$compile(document.querySelectorAll(".menu-themes > li .submenu")[i])($scope);
							}
						}
					}
					$compile(document.querySelectorAll(".menu-themes")[0])($scope);

					$('.menu-themes > li .submenu li').parent().parent().addClass("parentsThemes");

					// Jquery accordion
					$('.submenu').hide();

					$('.menu-themes > li > a').click(function(){		
						$(this).parents('li').children('.submenu').stop();
						$(this).parents('li').siblings('li').removeClass('active');
						$(this).parents('li').addClass('active'); //classToggle
						$(this).parents('li').siblings('li').children('.submenu').slideUp();
						$('.submenu > li').removeClass('active');
						$(this).parents('li.parentsThemes').children('.submenu').slideDown(); // slideToggle
					});

					$('.submenu > li').click(function(){
						$('.submenu > li').removeClass('active');
						$(this).addClass('active');				 
					});

				}

			});	

			// Reset active on clear filter
			$scope.$watch('letter', function() {
				if ($scope.letter == false) {
					$('.submenu > li').removeClass('active');
				}
			});

		}
	};
});



// TIMELINE
// -------------------------------------------------
direct.directive('timeline', function() {		
	return {		
		restrict: 'E',
		template: '<div id="my-timeline"></div>',
		controller: function($scope, $compile, $timeout) {			
			
			$scope.$watch('notices', function() {	

				// If notices exist and template = Grandes Dates
				if ($scope.notices != undefined && $scope.notices != null && ($scope.template.slug === 'grandes-dates' || $scope.template.slug === 'significant-dates' || $scope.template.slug === 'wichtige-daten') && $scope.notices.length > 0) {			

					// Vars
					var notices = $scope.notices;		

					// Timeline object declaration
					var dataObject = {
						"timeline": {
							"type": "default",
							"date": []
						}
					};		
					
					// Sets the timeline object from notices JSON
					for (var i=0; i<notices.length; i++) {	
						// Init Object
						dataObject.timeline.date[i] = {};
						// Start date
						dataObject.timeline.date[i].startDate = notices[i].date_start;
						// End date
						dataObject.timeline.date[i].endDate = notices[i].date_end;
						// Headline
						if( notices[i].reperes_historiques_non_protestant == 1 ){						
							dataObject.timeline.date[i].headline = '#';
							dataObject.timeline.date[i].headline += notices[i].title;
						}else{
							dataObject.timeline.date[i].headline = notices[i].title;
						}
						// Text
						dataObject.timeline.date[i].text = notices[i].chapeau;						
						// Asset
						dataObject.timeline.date[i].asset = {};
						// Media						
						dataObject.timeline.date[i].asset.media = notices[i].images.large;
						// Thumbnails
						dataObject.timeline.date[i].asset.thumbnail = notices[i].images.medium;
					}

					// When document's ready
            		setTimeout(function() {

            			// Sets the Timeline
                		createStoryJS({
							type: 				'timeline',
							width:				'100%',
							height:				'680',
							source:				dataObject,
							start_at_slide:		'0',
							embed_id:			'my-timeline',
							lang:				'fr',
							start_zoom_adjust:	'1'
			            });			            

            		},100);

            		//limiter le text de la bulle
					setTimeout(function() {						
						$( ".vco-navigation h3" ).each(function() {
							if( $(this).text().length > 45){ 
							  $(this).text($(this).text().substr(0,45)).append(' ...');
							}						
						});
						//Supprime le diese et ajoute une classe et suppirme vignette
						
							//ajouter un classe
							$( ".vco-navigation h3:contains('#')" ).addClass( "nonprot" );
							//Supprime vignette
							$( ".vco-navigation h3:contains('#')" ).siblings(".thumbnail").hide();
							//Supprime le # dans les vignettes
							$( ".vco-navigation h3:contains('#')").text($(".vco-navigation h3:contains('#')").text().substr(1, $(".vco-navigation h3").text().length -1) );
							
							//Supprime le # dans les slides
							$( ".vco-slider h3:contains('#')").text($(".vco-slider h3:contains('#')").text().substr(1, $(".vco-slider h3").text().length -1) );


					},500);

					

				}
				




			});	

		}
	};
});