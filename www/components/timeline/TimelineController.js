angular.module('app.controllers')

.controller('TimelineController', function($scope, socket) {
    $scope.calendars = [];
    
    // request the calendars for today from all logged in users from the server
    socket.emit('request calendars', new Date());
    
    // receive the requested calendars (they are sent back one by one)
    socket.on('receive calendar', function(calendar) {
        var index = $scope.calendars.push([]) - 1;
        calendar.forEach(function(event) {
            var calendarEvent = { start : new Date(Date.parse(event.start.dateTime)), end: new Date(Date.parse(event.end.dateTime)), title : event.summary};
            $scope.calendars[index].push(calendarEvent);
         });
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
});