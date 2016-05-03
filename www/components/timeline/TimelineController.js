angular.module('app.controllers')

.controller('TimelineController', function ($scope, socket) {
	$scope.calendars = [];

    // Fill up the time line with the hours between 7am and midnight.
    $scope.timerange = [];
    for(var i = 7; i < 24; i++){
        $scope.timerange.push(i > 12? i % 12: i);
    }

    $scope.pictures = [
        'img/father.jpg',
        'img/mother.png',
        'img/child1.jpg',
        'img/placeholder.jpg',
        'img/placeholder.jpg'
    ];

    $scope.currentHour = (new Date()).getHours();
    $scope.currentMinutes = (new Date()).getMinutes();

	// request the calendars for today from all logged in users from the server
	socket.emit('request calendars', new Date());

	// receive the requested calendars (they are sent back one by one)
	socket.on('receive calendar', function (calendar) {
		var index = $scope.calendars.push(calendar) - 1;

		// cast event times to Date-objects
		$scope.calendars[index].events.forEach(function (event) {
			event.start = new Date(event.start);
			event.end = new Date(event.end);
			console.log(event);
		});
		/*calendar.events.forEach(function (event) {
			var calendarEvent = {
				start: new Date(event.start),
				end: new Date(event.end),
				title: event.title
			};
			$scope.calendars[index].push(calendarEvent);
		});*/
	});

	/*$scope.calendars = [
	    [
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
	    ],
	    [
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
	    ],
	    [
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
	];*/
});