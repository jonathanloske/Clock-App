// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ionic-native-transitions', 'app.controllers', 'app.routes'])

.run(function ($ionicPlatform, $rootScope, $state, $ionicScrollDelegate, $ionicHistory, socket, leds) {

	var ledMode = 2;

	$rootScope.keyPress = function (event) {
		// If user presses 'a' or turns the knob counterclockwise
		if (event.keyCode === 65) {
			$rootScope.handleCounterClockwise();
			// If user presses 'd' or turns the knob clockwise
		} else if (event.keyCode === 68) {
			$rootScope.handleClockwise();
			// If user presses 'k' or presses the knob
		} else if (event.keyCode === 75) {
			$rootScope.toggleEditMode();
		} else if (event.keyCode === 76) {
			ledMode++;
			if (ledMode > 4) ledMode = 0;
			leds.setMode(ledMode);
		} else if (event.keyCode === 82) {
			document.location.href = 'index.html';
		}
	};

	socket.emit('clock - request all calendars', {
		day: moment().format()
	});
})

.config(function ($ionicNativeTransitionsProvider) {
	$ionicNativeTransitionsProvider.setDefaultOptions({
		triggerTransitionEvent: '$ionicView.afterEnter',
		slowdownfactor: 1,
		androidDelayFactor: 0,
		backInOppositeDirection: true,
	});
})

.factory('storage', function ($rootScope) {

	var calendars = [];
	var carSimulatorData = {};

	carSimulatorData['location'] = 'Home';
	carSimulatorData['battery'] = 80;
	carSimulatorData['range'] = carSimulatorData['battery'] * 3;
	carSimulatorData['oil'] = 30;

	return {
		// controllers can listen to changes of the storage
		subscribe: function (scope, callback) {
			var handler = $rootScope.$on('storage-has-changed', callback);
			scope.$on('$destroy', handler);
		},
		updateCalendar: function (calendar) {
			// find the calendar to replace (matching is done by user's name)
			var calendarExists = false;
			calendars.forEach(function (currentCal, index) {
				if (currentCal.name == calendar.name) {
					calendarExists = true;
					calendars[index] = calendar;
					return;
				}
			});

			// if this calendar doesnt exist yet, just add it
			if (!calendarExists) calendars.push(calendar);

			// notify controllers using this factory, that the storage has been updated
			$rootScope.$emit('storage-has-changed');
		},
		setCalendars: function (cals) {
			calendars = cals;
		},
		getCalendars: function () {
			return calendars;
		},
		updateCarSimulatorData: function (key, data) {
			carSimulatorData[key] = data;

			console.log(carSimulatorData);

			carSimulatorData['range'] = carSimulatorData['battery'] * 3;

			// notify controllers using this factory, that the storage has been updated
			$rootScope.$emit('storage-has-changed');
		},
		deleteCalendar: function (username) {
			calendars.forEach(function (currentCal, index) {
				if (currentCal.name == username) {
					calendars.splice(index, 1);
					$rootScope.$emit('storage-has-changed');
				}
			});
		},
		getCarSimulatorData: function () {
			return carSimulatorData;
		}
	};
})

.factory('leds', function ($rootScope) {

	function connectLEDs() {
		return new LEDController('192.168.1.150', 7890);
	}

	var leds = connectLEDs();

	return {
		updateTimeLeftInformation: function (timeLeftInformation) {
			leds.updateTimeLeftInformation(timeLeftInformation);
		},
		setMode: function (mode) {
			leds.setMode(mode);
		},
		reconnect: function () {
			leds = connectLEDs();
		},
		getMode: function () {
			return leds.getMode();
		}
	}
})

.factory('socket', function ($rootScope, storage, leds) {

	var socket = io.connect("http://mtin.de:8080", {
		query: 'id=clock'
	});

	socket.on('clock - calendar update', function (calendar) {
		// iterate over all events in the calendar to convert them into javascript Dates
		calendar.events.forEach(function (event) {
			event.start = new Date(event.start);
			event.end = new Date(event.end);
		});
		// once that is done, save the updated calendar to the storage
		storage.updateCalendar(calendar);
	});

	socket.on('clock - user deleted', function (username) {
		storage.deleteCalendar(username);
	});

	socket.on('[Car Simulator Data] -  Update', function (data) {
		if (data['key'] == 'LED_Mode_Update') {
			leds.setMode(data['payLoad']);
			return;
		}

		storage.updateCarSimulatorData(data['key'], data['payLoad']);
	});

	socket.on('car simulator - set led mode', function (mode) {
		leds.setMode(mode);
	});

	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
})

.directive('leaveTimeIndicator', function () {
	return {
		scope: {
			transit: '=',
			otherTransit: '=',
			picture: '=',
			small: '='
		},
		templateUrl: 'components/timetoleave/leave-time-indicator.html',
		link: function (scope, element, attrs) {
			scope.floor = Math.floor;
		}
	};
});

angular.module('app.controllers', []);