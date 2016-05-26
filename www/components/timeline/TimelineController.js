angular.module('app.controllers')

.controller('TimelineController', function ($scope, storage, socket, $interval, $document, $rootScope, $ionicScrollDelegate, $ionicViewSwitcher, $ionicNativeTransitions, $state, $window) {

	$scope.goTo = function () {
		$ionicViewSwitcher.nextDirection('back');
		$state.go('timeToLeaveOverview');
	};

	$scope.floor = Math.floor;
	$scope.keys = Object.keys;
	$scope.editMode = false;
	$scope.editCalendarMode = false;
	$scope.editTransitOption = false;
	$scope.pixelWidthOfOneHour = $window.innerWidth * 0.85 / 4;

	$scope.transitOptions = [
		'car', 'walk', 'bus', 'bicycle', 'cancel'
	];
	// These are the transit options we get from the server. Displaying them is not
	// as consistent as our current options so we translate between the two.
	$scope.transitTranslations = [
		'car', 'walk', 'subway', 'bicycle'
	];

	// Fill up the time line with the hours between 7am and midnight.
	$scope.timerange = [];
	for (var i = 7; i < 24; i++) {
		$scope.timerange.push(i > 12 ? i % 12 : i);
	}
	$scope.timerange.push('');

	$scope.categoryTranslations = {
		work: 'briefcase',
		sports: 'ios-americanfootball',
		leisure: 'ios-game-controller-a'
	}

	$scope.pixelWidthOfTimeline = $window.innerWidth * .85;
	$scope.minimapScrollPosition = 0;

	$scope.adjustMinimap = function () {
		// Subtract the 'empty' part of the timeline so the alignment works
		// The empty part is 0.85 - 0.5 of the width.
		// Divide that by the value of the whole timeline and multiply it again
		// by the width of the visible timeline.
		$scope.minimapScrollPosition = ($ionicScrollDelegate.getScrollPosition().left - $window.innerWidth * 0.34) / ($scope.pixelWidthOfOneHour * $scope.timerange.length - 1) * 85;
		$scope.$apply();
	};

	var prepareCalendarForTimeline = function () {
		// get the users' carSimulatorData from the storage and listen to updates
		$scope.carSimulatorData = storage.getCarSimulatorData();
		// get the users' calendars from the storage and listen to updates
		$scope.calendars = storage.getCalendars();
		$scope.scrollToTime(new Date());
		for (var i = 0; i < $scope.calendars.length; i++) {
			for (var j = $scope.calendars[i].events.length - 1; j >= 0; j--) {
				if ($scope.calendars[i].events[j].start.getDay() !== new Date().getDay()) {
					$scope.calendars[i].events.splice(j, 1);
				}
			}
		}
		addDurationAndDistanceToEvents();
	};

	storage.subscribe($scope, prepareCalendarForTimeline);

	var setTimelineMarker = function(hour, minute){
		$scope.timelineMarkerPosition = ((hour - 7) + minute / 60 ) * 85 / 4;
	}

	// Continually update the time so we can display it
	$interval(function () {
		$scope.currentHour = ((!$scope.carSimulatorData['time']) ? new Date().getHours() : Math.floor($scope.carSimulatorData['time'] / 3600));
		$scope.currentMinutes = ((!$scope.carSimulatorData['time']) ? new Date().getMinutes() : Math.floor($scope.carSimulatorData['time'] / 60 % 60));
		if ($scope.currentMinutes < 10) {
			$scope.currentMinutes = '0' + $scope.currentMinutes;
		};
		if(!$scope.scrubTimelineMarker){
			setTimelineMarker($scope.currentHour,$scope.currentMinutes);
			$scope.scrubMarkerMinute = 0;
		}
	}, 300);

	$scope.$on("$ionicView.beforeEnter", function (event, data) {
		prepareCalendarForTimeline();
	});
	$scope.$on("$ionicView.enter", function (event, data) {
		$scope.scrubTimelineMarker = false;
		$scope.scrubMarkerMinute = 0;
		$scope.selectedTransitOptionIndex = 0;
		$scope.selectedEvent = 0;

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
				$scope.selectedTransitOptionIndex;
				var timelineMarkerDate = new Date();
				timelineMarkerDate.setMinutes(Number($scope.currentMinutes) + $scope.scrubMarkerMinute);
				$scope.scrollToTime(timelineMarkerDate);
			} else if ($scope.selectEventMode){
				$scope.selectedTransitOptionIndex = 0;
				$scope.editTransitOption = true;
			} else {
				$scope.selectEventMode = true;
				$scope.selectedEvent = 0;
				// Find all events that coincide with the selected time
				var timelineMarkerDate = new Date();
				timelineMarkerDate.setMinutes(Number($scope.currentMinutes) + $scope.scrubMarkerMinute);
				$scope.selectableEvents = [];
				for(var i = 0; i < $scope.calendars.length; i++){
					for(var j = 0; j < $scope.calendars[i].events.length; j++){
						if(timelineMarkerDate.getTime() >  $scope.calendars[i].events[j].start && timelineMarkerDate.getTime() < $scope.calendars[i].events[j].end){
							$scope.selectableEvents.push([i, j]);
						}
					}
				}
				$scope.selectedUserIndex = $scope.selectableEvents[0][0];
				$scope.selectedCalendarIndex = $scope.selectableEvents[0][1];
				$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
			}
		};

		$rootScope.handleClockwise = function () {
			if ($scope.editTransitOption) {
				$scope.selectedTransitOptionIndex = $scope.selectedTransitOptionIndex < $scope.transitOptions.length - 1 ? $scope.selectedTransitOptionIndex + 1 : $scope.selectedTransitOptionIndex;
			} else if ($scope.selectEventMode){
				if($scope.selectedEvent < $scope.selectableEvents.length - 1){
					$scope.selectedEvent++;
					$scope.selectedUserIndex = $scope.selectableEvents[$scope.selectedEvent][0];
					$scope.selectedCalendarIndex = $scope.selectableEvents[$scope.selectedEvent][1];
					$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
				}
			} else {
				$scope.scrubTimelineMarker = true;
				$scope.scrubMarkerMinute += 30;
				var date = new Date();
				date.setMinutes(Number($scope.currentMinutes) + $scope.scrubMarkerMinute);
				$scope.scrollToTime(date);
			}
		};

		$rootScope.handleCounterClockwise = function () {
			if ($scope.editTransitOption) {
				if ($scope.selectedTransitOptionIndex > 0) {
					$scope.selectedTransitOptionIndex--;
				}
			} else if ($scope.selectEventMode){
				if($scope.selectedEvent > 0){
					$scope.selectedEvent--;
					$scope.selectedUserIndex = $scope.selectableEvents[$scope.selectedEvent][0];
					$scope.selectedCalendarIndex = $scope.selectableEvents[$scope.selectedEvent][1];
					$scope.scrollToTime($scope.calendars[$scope.selectedUserIndex].events[$scope.selectedCalendarIndex].start);
				}
			} else {
				if ($ionicScrollDelegate.getScrollPosition().left === 0) {
					$ionicNativeTransitions.stateGo('timeToLeaveOverview', {}, {
						"type": "slide",
						"direction": "right"
					});
				} else {
					$scope.scrubTimelineMarker = true;
					$scope.scrubMarkerMinute -= 30;
					var date = new Date();
					date.setMinutes(Number($scope.currentMinutes) + $scope.scrubMarkerMinute);
					$scope.scrollToTime(date);
				}
			}
		};
	});

	$scope.scrollToTime = function (time) {
		$ionicScrollDelegate.scrollTo((time.getHours() - 7) * $scope.pixelWidthOfOneHour + time.getMinutes() / 60 * $scope.pixelWidthOfOneHour, 0, true);
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
	};

	addDurationAndDistanceToEvents();
});