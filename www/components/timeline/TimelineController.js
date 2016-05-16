angular.module('app.controllers')

.controller('TimelineController', function ($scope, storage, $timeout, $document, $rootScope, $ionicScrollDelegate, $ionicViewSwitcher, $state, $window) {
	// get the users' calendars from the storage and listen to updates
	$scope.calendars = storage.getCalendars();

	$scope.goTo = function(){
		$ionicViewSwitcher.nextDirection('back');
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
	$scope.floor = Math.floor;

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

	$scope.editMode = false;
	$scope.editCalendarMode = false;
	$scope.editTransitOption = false;
	$scope.pixelWidthOfOneHour = $window.innerWidth / 4;

	$scope.transitOptions = [
		'car', 'walk', 'bus', 'bicycle'
	];

	$scope.$on("$ionicView.enter", function(event, data){
		$rootScope.toggleEditMode = function (event) {
			if($scope.editTransitOption){
				$scope.editMode = false;
				$scope.editCalendarMode = false;
				$scope.editTransitOption = false;
			} else if ($scope.editCalendarMode) {
				if($scope.selectedCalendarIndex === -1){
					$scope.editCalendarMode = false;
				} else {
					$scope.selectedTransitOptionIndex = 0;
					$scope.editTransitOption = true;
				}
			} else if($scope.editMode){
				if($scope.selectedUserIndex === -1){
					$scope.editMode = false;
				} else {
					$scope.selectedCalendarIndex = 0;
					$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
					$scope.editCalendarMode = true;
				}
			} else {
				$scope.editMode = true;
				$scope.selectedUserIndex = 0;
			}
		};

		$rootScope.handleClockwise = function (event) {
			if($scope.editTransitOption){
				$scope.selectedTransitOptionIndex = $scope.selectedTransitOptionIndex < $scope.transitOptions.length - 1? $scope.selectedTransitOptionIndex + 1 : $scope.selectedTransitOptionIndex;
			} else if ($scope.editCalendarMode) {
				$scope.selectedCalendarIndex = $scope.selectedCalendarIndex < $scope.calendars[$scope.selectedUserIndex].events.length - 1? $scope.selectedCalendarIndex + 1 : $scope.selectedCalendarIndex;
				$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
			} else if ($scope.editMode) {
				$scope.selectedUserIndex = $scope.selectedUserIndex < $scope.calendars.length - 1? $scope.selectedUserIndex + 1 : $scope.selectedUserIndex;
			} else {
				$ionicScrollDelegate.scrollBy($window.innerWidth / 4 - 2.5, 0, true);
			}
		};

		$rootScope.handleCounterClockwise = function (event) {
			if($scope.editTransitOption){
				if($scope.selectedTransitOptionIndex > 0){
					$scope.selectedTransitOptionIndex--;
				}
			} else if($scope.editCalendarMode){
				if($scope.selectedCalendarIndex >= 0){
					$scope.selectedCalendarIndex--;
					if($scope.selectedCalendarIndex >= 0){
						$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
					}
				}
			} else if ($scope.editMode) {
				if($scope.selectedUserIndex >= 0){
					$scope.selectedUserIndex--;
				}
			} else {
				if ($ionicScrollDelegate.getScrollPosition().left === 0) {
					$ionicViewSwitcher.nextDirection('back');
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

	var addDurationAndDistanceToEvents = function(){
		for (var i = 0; i < $scope.calendars.length; i++){
			for (var j = 0; j < $scope.calendars[i].events.length; j++){
				var event = $scope.calendars[i].events[j];
				if(j === 0){
					$scope.calendars[i].events[j].distanceToEventBeforeInMinutes = event.start.getHours() * 60 + event.start.getMinutes() - 7 * 60;
				} else {
					var eventBefore = $scope.calendars[i].events[j - 1];
					$scope.calendars[i].events[j].distanceToEventBeforeInMinutes =
						 event.start.getHours()     * 60 + event.start.getMinutes() -
						(eventBefore.end.getHours() * 60 + eventBefore.end.getMinutes());
				}
				$scope.calendars[i].events[j].durationInMinutes =
					 event.end.getHours()   * 60 + event.end.getMinutes() -
					(event.start.getHours() * 60 + event.start.getMinutes());
			}
		}
	}

	$scope.pixelWidthOfTimeline = $window.innerWidth * .85 * 4.125;
	$scope.minimapScrollPosition = 0;

	$scope.adjustMinimap = function(){
		$scope.minimapScrollPosition = $ionicScrollDelegate.getScrollPosition().left / $scope.pixelWidthOfTimeline * 85;
		$scope.$apply();
	}

	addDurationAndDistanceToEvents();
});