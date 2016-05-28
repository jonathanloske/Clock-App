angular.module('app.controllers')

.controller('TimeToLeaveController', function ($rootScope, $scope, $state, $ionicViewSwitcher, $ionicNativeTransitions, $interval, $timeout, storage, leds) {
	// get the users' calendars from the storage and listen to updates
	$scope.calendars = storage.getCalendars();
	$scope.carSimulatorData = storage.getCarSimulatorData();
	retrieveLeaveData();
	$scope.floor = Math.floor;

	var ledMode = 0;

	storage.subscribe($scope, function onStorageUpdated() {
		$scope.calendars = storage.getCalendars();
		$scope.carSimulatorData = storage.getCarSimulatorData();
		retrieveLeaveData();
		$scope.$apply();
	});

	$scope.weather = {
		condition: 'partlysunny',
		temperature: 71
	}

	$scope.goToIndex = function (index) {
		if (index === 0) {
			$ionicViewSwitcher.nextDirection('back');
			$state.go('carStatus');
		} else {
			$ionicViewSwitcher.nextDirection('forward');
			$state.go('timeline');
		}
	}

	function retrieveLeaveData() {
		$scope.familyMembers = [];

		for (var i = 0; i < $scope.calendars.length; i++) {
			var calendar = $scope.calendars[i];

			// set the user data
			var parent = {
				picture: calendar.picture,
				nextEvent: "",
				transit: []
			};

			// find the next event for the user
			var nextEvent = {
				msecsUntilStart: -1,
				event: null
			};
			var now = (!$scope.carSimulatorData['time']) ? new Date() : new Date(new Date().getTime() - (new Date().getTime() % 86400000) + 25200000 + $scope.carSimulatorData['time'] * 1000);
			calendar.events.forEach(function (event) {
				var msecsUntilEvent = (event.start - now);
				// we dont want events that are already over or ones that the user is
				// too late for anyway (we take 2 minutes after having left for the next
				// event as being too late)
				if (msecsUntilEvent < 0 ||
					(event.optimized_transit && event.start.getTime() -
					 event.optimized_transit.best.duration * 60000 - now.getTime() < -1000 * 60 * 2 &&
					 event.start.getTime() - event.optimized_transit.alternative.duration * 60000 - now.getTime() < -1000 * 60 * 2)){
					return;
				}
				if (nextEvent.msecsUntilStart === -1 || nextEvent.msecsUntilStart > msecsUntilEvent) {
					nextEvent.msecsUntilStart = msecsUntilEvent;
					nextEvent.event = event;
				}
			});

			// retrieve transit information for the next event
			if (nextEvent.event != null) {
				parent.nextEvent = nextEvent.event.title;
				if (nextEvent.event.optimized_transit != undefined) {
					var timeToLeaveBest;
					var transitOption;
					if(nextEvent.event.userSelectedTransitOption === ""){
						timeToLeaveBest = new Date(nextEvent.event.start.getTime() - nextEvent.event.optimized_transit.best.duration * 60000);
					} else {
						// Need to translate 'walk' to walking
						transitOption = nextEvent.event.userSelectedTransitOption === 'walk' ? 'walking' : nextEvent.event.userSelectedTransitOption;
						timeToLeaveBest = new Date(nextEvent.event.start.getTime() - nextEvent.event.transit_options[transitOption].duration * 60000);
					}

					var timeToLeaveSecondBest = new Date(nextEvent.event.start.getTime() - nextEvent.event.optimized_transit.alternative.duration * 60000);
					parent.transit = [
						{
							type: nextEvent.event.userSelectedTransitOption === "" ? nextEvent.event.optimized_transit.best.name : transitOption,
							hoursLeft: Math.floor(Math.round((timeToLeaveBest - now) / 1000 / 60 / 60)),
							minutesLeft: Math.round((timeToLeaveBest - now) / 1000 / 60)
					  },
						{
							type: nextEvent.event.optimized_transit.alternative.name,
							hoursLeft: Math.floor(Math.round((timeToLeaveBest - now) / 1000 / 60 / 60)),
							minutesLeft: Math.round((timeToLeaveSecondBest - now) / 1000 / 60)
					  }

					];
				}
			} else {
				parent.nextEvent = '- No more events today -';
			}

			$scope.familyMembers.push(parent);
		};
	};

	function updateLEDs() {
		var ledData = [];
		var colors = [
			[176,105,131],
			[115,181,66],
			[52,150,133],
			[248,100,81]
		]
		Object.keys($scope.familyMembers).forEach(function (key, i) {

			var userData = {
				minutes: $scope.familyMembers[key].transit.length > 0 ? $scope.familyMembers[key].transit[0].minutesLeft : 60,
				color: colors[i]
			}

			ledData.push(userData);
		});

		//currentLedMode(ledData);
		leds.updateTimeLeftInformation(ledData);
	};

	$interval(function(){
		retrieveLeaveData();
	}, 300);

	$interval(function(){
		updateLEDs();
	}, 1000);


	$scope.$on("$ionicView.enter", function (event, data) {
		$timeout(function(){
			$rootScope.handleCounterClockwise = function () {
				// $state.go('carStatus');
				$ionicNativeTransitions.stateGo('carStatus', {}, {
					"type": "slide",
					"direction": "right"
				});
			};

			$rootScope.handleClockwise = function () {
				// $state.go('timeline');
				$ionicNativeTransitions.stateGo('timeline', {}, {
					"type": "slide",
					"direction": "left"
				});
			};
		}, 1000);
		$rootScope.toggleLedMode = function () {
			ledMode++;
			if (ledMode > 4) ledMode = 0;
			leds.setMode(ledMode);
		}
	});
	$scope.$on("$ionicView.leave", function (event, data) {
		$rootScope.handleClockwise = function(){};
		$rootScope.handleCounterClockwise = function(){};
		$rootScope.toggleEditMode = function(){};
		$rootScope.toggleLedMode = function(){};
	});
});