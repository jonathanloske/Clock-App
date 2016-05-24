angular.module('app.controllers')

.controller('TimelineController', function ($scope, storage, socket, $interval, $document, $rootScope, $ionicScrollDelegate, $ionicViewSwitcher, $ionicNativeTransitions, $state, $window) {
	// get the users' calendars from the storage and listen to updates
	$scope.calendars = storage.getCalendars();

	$scope.goTo = function () {
		$ionicViewSwitcher.nextDirection('back');
		$state.go('timeToLeaveOverview');
	};

	$scope.floor = Math.floor;
	$scope.keys = Object.keys;

	var prepareCalendarForTimeline = function () {
		$scope.calendars = storage.getCalendars();
		$scope.scrollToTime(new Date());
		for (var i = 0; i < $scope.calendars.length; i++) {
			for (var j = 0; j < $scope.calendars[i].events.length; j++) {
				if ($scope.calendars[i].events[j].start.getDay() !== new Date().getDay()) {
					$scope.calendars[i].events.splice(j);
				}
			}
		}
		addDurationAndDistanceToEvents();
	};

	storage.subscribe($scope, prepareCalendarForTimeline);
	$scope.floor = Math.floor;

	// Fill up the time line with the hours between 7am and midnight.
	$scope.timerange = [];
	for (var i = 7; i < 24; i++) {
		$scope.timerange.push(i > 12 ? i % 12 : i);
	}

	// Continually update the time so we can display it
	$interval(function () {
		$scope.currentHour = (new Date()).getHours();
		$scope.currentMinutes = (new Date()).getMinutes();
		if ($scope.currentMinutes < 10) {
			$scope.currentMinutes = '0' + $scope.currentMinutes;
		};
		if(!$scope.scrubTimelineMarker){
			setTimelineMarker($scope.currentHour,$scope.currentMinutes);
		}
	}, 300);

	var setTimelineMarker = function(hour, minute){
		$scope.timelineMarkerPosition = ((hour - 7) + minute / 60 ) * 85 / 4;
	}

	var markEventAtTimeMarker = function(){
		var date = new Date();
		date.setHours($scope.currentHour + $scope.scrubMarkerHour);
		$scope.scrollToTime(date);
		// Find all events that occur at the given time
		for(var i = 0; i < $scope.calendars[$scope.selectedUserIndex].events.length; i++){
			var event = $scope.calendars[$scope.selectedUserIndex].events[i];
			var timelineMarkerDate = new Date();
			timelineMarkerDate.setHours($scope.currentHour + $scope.scrubMarkerHour);
			if(event.end.getTime() - timelineMarkerDate.getTime() > 0 && timelineMarkerDate.getTime() - event.start.getTime() > 0){
				// Highlight the event we just found
				$scope.selectedCalendarIndex = i;
				$scope.scrollToTime(event.start);
			}
		}
	}

	$scope.scrubTimelineMarker = false;
	$scope.editMode = false;
	$scope.editCalendarMode = false;
	$scope.editTransitOption = false;
	$scope.pixelWidthOfOneHour = $window.innerWidth * 0.85 / 4;
	$scope.scrubMarkerHour = 0;
	$scope.selectedTransitOptionIndex = 0;

	$scope.transitOptions = [
		'car', 'walk', 'bus', 'bicycle', 'cancel'
	];
	// These are the transit options we get from the server. Displaying them is not
	// as consistent as our current options so we translate between the two.
	$scope.transitTranslations = [
		'car', 'walk', 'subway', 'bicycle'
	]

	$scope.$on("$ionicView.beforeEnter", function (event, data) {
		prepareCalendarForTimeline();
	});
	$scope.$on("$ionicView.enter", function (event, data) {
		$rootScope.toggleEditMode = function () {
			if ($scope.editTransitOption) {
				if ($scope.selectedTransitOptionIndex !== $scope.transitOptions.length - 1) {
					$scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].userSelectedTransitOption = $scope.transitTranslations[$scope.selectedTransitOptionIndex];
					storage.setCalendars($scope.calendars);

					// send data to server
					var data = {
						name: $scope.calendars[$scope.selectedUserIndex].name,
						event: $scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex]
					};
					socket.emit('clock - event updated', data);

					// Stay in selection mode even after selecting
					// $scope.editMode = false;
					// $scope.editCalendarMode = false;
				}
				$scope.editTransitOption = false;
				$scope.selectEventMode = false;
				scrubTimelineMarker = false;
				$scope.scrubMarkerHour = 0;
				$scope.scrollToTime(new Date());
			} else if ($scope.selectEventMode){
				$scope.editTransitOption = true;
			} else {
				$scope.selectEventMode = true;
				$scope.selectedUserIndex = 0;
				markEventAtTimeMarker();
			}
		};

		$rootScope.handleClockwise = function () {
			if ($scope.editTransitOption) {
				$scope.selectedTransitOptionIndex = $scope.selectedTransitOptionIndex < $scope.transitOptions.length - 1 ? $scope.selectedTransitOptionIndex + 1 : $scope.selectedTransitOptionIndex;
			} else if ($scope.selectEventMode){
				if($scope.selectedUserIndex < $scope.calendars.length){
					$scope.selectedUserIndex++;
				}
				markEventAtTimeMarker();
			} else {
				$scope.scrubTimelineMarker = true;
				$scope.scrubMarkerHour++;
				setTimelineMarker($scope.currentHour + $scope.scrubMarkerHour, $scope.currentMinutes);
				var date = new Date();
				date.setHours($scope.currentHour + $scope.scrubMarkerHour);
				$scope.scrollToTime(date);
			}
		};

		$rootScope.handleCounterClockwise = function () {
			if ($scope.editTransitOption) {
				if ($scope.selectedTransitOptionIndex > 0) {
					$scope.selectedTransitOptionIndex--;
				}
			} else if ($scope.selectEventMode){
				if ($scope.selectedUserIndex > 0) {
					$scope.selectedUserIndex--;
				}
				markEventAtTimeMarker();
			} else {
				if ($ionicScrollDelegate.getScrollPosition().left === 0) {
					// $state.go('timeToLeaveOverview');
					$ionicNativeTransitions.stateGo('timeToLeaveOverview', {}, {
						"type": "slide",
						"direction": "right"
					});
				} else {
					$scope.scrubTimelineMarker = true;
					$scope.scrubMarkerHour--;
					setTimelineMarker($scope.currentHour + $scope.scrubMarkerHour, $scope.currentMinutes);
					var date = new Date();
					date.setHours($scope.currentHour + $scope.scrubMarkerHour);
					$scope.scrollToTime(date);
				}
			}
		};

		$scope.scrubTimelineMarker = false;
		$scope.scrubMarkerHour = 0;
	});

	$scope.scrollToTime = function (time) {
		// Center the time
		$ionicScrollDelegate.scrollTo((time.getHours() - 7) * $scope.pixelWidthOfOneHour + time.getMinutes() / 60 * $scope.pixelWidthOfOneHour - $scope.pixelWidthOfOneHour, 0, true);
	};

	$scope.calendars = [
		{
			picture: 'img/father.jpg',
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
		]
		},
		{
			picture: 'img/mother.png',
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
		]
		},
		{
			picture: 'img/child1.jpg',
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
		]
		}
	];

	var addDurationAndDistanceToEvents = function () {
		for (var i = 0; i < $scope.calendars.length; i++) {
			for (var j = 0; j < $scope.calendars[i].events.length; j++) {
				var event = $scope.calendars[i].events[j];
				if (j === 0) {
					$scope.calendars[i].events[j].distanceToEventBeforeInMinutes = event.start.getHours() * 60 + event.start.getMinutes() - 7 * 60;
				} else {
					var eventBefore = $scope.calendars[i].events[j - 1];
					$scope.calendars[i].events[j].distanceToEventBeforeInMinutes =
						event.start.getHours() * 60 + event.start.getMinutes() -
						(eventBefore.end.getHours() * 60 + eventBefore.end.getMinutes());
				}
				$scope.calendars[i].events[j].durationInMinutes =
					event.end.getHours() * 60 + event.end.getMinutes() -
					(event.start.getHours() * 60 + event.start.getMinutes());
			}
		}
	}

	$scope.pixelWidthOfTimeline = $window.innerWidth * .85 * 4.125;
	$scope.minimapScrollPosition = 0;

	$scope.adjustMinimap = function () {
		$scope.minimapScrollPosition = $ionicScrollDelegate.getScrollPosition().left / $scope.pixelWidthOfTimeline * 85;
		$scope.$apply();
	}

	addDurationAndDistanceToEvents();
});