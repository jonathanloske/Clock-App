angular.module('app.controllers')

.controller('TimelineController', function ($scope, storage, $timeout, $document, $rootScope, $ionicScrollDelegate, $state, $ionicActionSheet, $window) {
	// get the users' calendars from the storage and listen to updates
	$scope.calendars = storage.getCalendars();

	$scope.goTo = function(){
		$state.go('timeToLeaveOverview');
	};

	storage.subscribe($scope, function onStorageUpdated() {
		$scope.calendars = storage.getCalendars();
		$scope.scrollToTime(new Date());
		for(var i = 0; i < $scope.calendars.length; i++){
			for( var j = 0; j < $scope.calendars[i].events.length; j++ ){
				if($scope.calendars[i].events[j].start.getDay() !== new Date().getDay()){
					$scope.calendars[i].events.splice(j);
				}
			}
		}
		$scope.$apply();
	});

	// Fill up the time line with the hours between 7am and midnight.
	$scope.timerange = [];
	for (var i = 7; i < 24; i++) {
		$scope.timerange.push(i > 12 ? i % 12 : i);
	}

	// Continually update the time so we can display it
	var updateTime = function(){
		$scope.currentHour = (new Date()).getHours();
		$scope.currentMinutes = (new Date()).getMinutes();
		if($scope.currentMinutes < 10){
			$scope.currentMinutes = '0' + $scope.currentMinutes;
		};
		$timeout(updateTime, 300);
	};

	updateTime();

	$scope.selectedUserIndex = 0;
	$scope.selectedCalendarIndex = 0;
	$scope.editMode = false;
	$scope.editCalendarMode = false;
	$scope.pixelWidthOfOneHour = $window.innerWidth / 4 - 2.5;

	$scope.transitOptions = [
		'car', 'walk', 'public transport', 'bike'
	];

	$scope.$on("$ionicView.enter", function(event, data){
		$rootScope.toggleEditMode = function (event) {
			if ($scope.editCalendarMode) {
				$ionicActionSheet.show({
					buttons: [
						{ text: 'Car' },
						{ text: 'Walk' },
						{ text: 'Public Transport' },
						{ text: 'Bike' }
					],
					titleText: 'Choose transit option',
					cancelText: 'Cancel',
					cancel: function() {
						$scope.editMode = false;
						$scope.editCalendarMode = false;
					},
					buttonClicked: function(index) {
						$scope.editMode = false;
						$scope.editCalendarMode = false;
					}
				});
			} else if($scope.editMode){
				$scope.editCalendarMode = true;
			} else {
				$scope.editMode = true;
				$scope.selectedUserIndex = 0;
				$scope.selectedCalendarIndex = 0;
			}
		};

		$rootScope.handleClockwise = function (event) {
			if ($scope.editCalendarMode) {
				$scope.selectedCalendarIndex = $scope.selectedCalendarIndex < $scope.calendars[$scope.selectedUserIndex].events.length - 1? $scope.selectedCalendarIndex + 1 : $scope.selectedCalendarIndex;
				$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
			} else if ($scope.editMode) {
				$scope.selectedUserIndex = $scope.selectedUserIndex < $scope.calendars.length - 1? $scope.selectedUserIndex + 1 : $scope.selectedUserIndex;
			} else {
				$ionicScrollDelegate.scrollBy($window.innerWidth / 4 - 2.5, 0, true);
			}
		};

		$rootScope.handleCounterClockwise = function (event) {
			if($scope.editCalendarMode){
				if($scope.selectedCalendarIndex === 0){
					$scope.editCalendarMode = false;
				} else {
					$scope.selectedCalendarIndex--;
					$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
				}
			} else if ($scope.editMode) {
				if($scope.selectedUserIndex === 0){
					$scope.editMode = false;
				} else {
					$scope.selectedUserIndex--;
				}
			} else {
				if ($ionicScrollDelegate.getScrollPosition().left === 0) {
					$state.go('timeToLeaveOverview');
				} else {
					$ionicScrollDelegate.scrollBy(-1 * $window.innerWidth / 4 - 2.5, 0, true);
				}
			}
		};
	});

	$scope.scrollToTime = function (time) {
		// Center the time
		$ionicScrollDelegate.scrollTo((time.getHours() - 7) * $scope.pixelWidthOfOneHour + time.getMinutes() / 60  * $scope.pixelWidthOfOneHour - $window.innerWidth / 4, 0, true);
	};

	$scope.calendars = [
		{ 	picture: 'img/father.jpg',
			events: [
			{
				start: new Date(2016, 05, 01, 07, 10),
				end: new Date(2016, 05, 01, 07, 45),
				title: 'Breakfast (alone)'
			},
			{
				start: new Date(2016, 05, 01, 09),
				end: new Date(2016, 05, 01, 12),
				title: 'Work'
			},
			{
				start: new Date(2016, 05, 01, 12),
				end: new Date(2016, 05, 01, 13),
				title: 'Business lunch'
			},
			{
				start: new Date(2016, 05, 01, 13),
				end: new Date(2016, 05, 01, 17),
				title: 'Slacking off'
			},
			{
				start: new Date(2016, 05, 01, 18),
				end: new Date(2016, 05, 01, 19),
				title: 'Gym'
			}
		]},
		{ 	picture: 'img/mother.png',
			events: [
			{
				start: new Date(2016, 05, 01, 08, 0),
				end: new Date(2016, 05, 01, 08, 30),
				title: 'Breakfast'
			},
			{
				start: new Date(2016, 05, 01, 09),
				end: new Date(2016, 05, 01, 12),
				title: 'Work'
			},
			{
				start: new Date(2016, 05, 01, 12),
				end: new Date(2016, 05, 01, 13),
				title: 'Business lunch'
			},
			{
				start: new Date(2016, 05, 01, 13),
				end: new Date(2016, 05, 01, 17),
				title: 'Slacking off'
			},
			{
				start: new Date(2016, 05, 01, 18),
				end: new Date(2016, 05, 01, 19),
				title: 'Gym'
			}
		]},
		{ 	picture: 'img/child1.jpg',
			events: [
			{
				start: new Date(2016, 05, 01, 08, 0),
				end: new Date(2016, 05, 01, 08, 30),
				title: 'Breakfast'
			},
			{
				start: new Date(2016, 05, 01, 09),
				end: new Date(2016, 05, 01, 15),
				title: 'School'
			},
			{
				start: new Date(2016, 05, 01, 15, 30),
				end: new Date(2016, 05, 01, 17),
				title: 'Choir'
			}
		]}
	];
});