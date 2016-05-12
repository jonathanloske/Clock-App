// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'app.controllers', 'app.routes'])

.run(function ($ionicPlatform, $rootScope, $state, $ionicScrollDelegate, socket) {
	$ionicPlatform.ready(function () {
		if (window.cordova && window.cordova.plugins.Keyboard) {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

			// Don't remove this line unless you know what you are doing. It stops the viewport
			// from snapping when text inputs are focused. Ionic handles this internally for
			// a much nicer keyboard experience.
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
	});

	$rootScope.keyPress = function (event) {
		// If user presses 'a' or turns the knob counterclockwise
		if (event.keyCode === 65) {
			$rootScope.handleCounterClockwise();
		// If user presses 'd' or turns the knob clockwise
		} else if (event.keyCode === 68) {
			$rootScope.handleClockwise();
		// If user presses the Space bar or presses the knob
		} else if (event.keyCode === 32) {
			$rootScope.toggleEditMode();
		}
	};

	socket.emit('clock - request all calendars', {
		day: new Date()
	});
})


.factory('storage', function ($rootScope) {

	var calendars = [];
	var carSimulatorData = {};

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
		updateCarSimulatorData: function (key, newCarSimulatorData) {
			carSimulatorData[key] = newCarSimulatorData;

			// notify controllers using this factory, that the storage has been updated
			$rootScope.$emit('storage-has-changed');
		},
		getCarSimulatorData: function () {
			return carSimulatorData;
		}
	};
})

.factory('socket', function ($rootScope, storage) {

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
	
	socket.on('[Car Simulator Data] - Battery Update', function (data) {
		storage.updateCarSimulatorData('battery_level', data);
	});
	
	socket.on('[Car Simulator Data] - Oil Update', function (data) {
		storage.updateCarSimulatorData('oil_level', data);
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
});

angular.module('app.controllers', []);