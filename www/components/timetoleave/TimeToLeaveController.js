angular.module('app.controllers')

.controller('TimeToLeaveController', function($scope, socket) {

    // Jonas socket comm code START
    socket.on('calendar', function (data) {
        console.log(data);
        // socket.emit('calendar_ack', { my: 'data' });
    });
    // Jonas socket comm code END

    $scope.parents = [
        {
            transit: [
                {
                    type: 'car',
                    minutesLeft: 30
                },
                {
                    type: 'walk',
                    minutesLeft: 10
                }
            ],
            picture: 'img/father.jpg'
        },
        {
            transit: [
                {
                    type: 'bus',
                    minutesLeft: 20
                },
                {
                    type: 'walk',
                    minutesLeft: 10
                }
            ],
            picture: 'img/mother.png'
        }
    ];
    $scope.children = [
        {
            transit: [
                {
                    type: 'walk',
                    minutesLeft: 40
                },
                {
                    type: 'bicycle',
                    minutesLeft: 50
                }
            ],
            picture: 'img/child1.jpg'
        }
    ];
});