angular.module('app.controllers')

.controller('TimeToLeaveController', function ($scope, storage) {
	// get the users' calendars from the storage and listen to updates
	$scope.calendars = storage.getCalendars();

	storage.subscribe($scope, function onStorageUpdated() {
		$scope.calendars = storage.getCalendars();
		$scope.$apply();
	});

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