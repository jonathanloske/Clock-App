angular.module('app.controllers')

.controller('TimelineController', function($scope) {
    $scope.calendars = [
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
    ];

    $scope.timerange = [];
    for(var i = 7; i < 24; i++){
        $scope.timerange.push(i > 12? i % 12: i);
    }
});