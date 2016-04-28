angular.module('app.controllers')

.controller('TimeToLeaveController', function($scope, socket) {

        // Jonas socket comm code START
        socket.on('calendar', function (data) {
          console.log(data);
          // socket.emit('calendar_ack', { my: 'data' });
        });
        // Jonas socket comm code END
});