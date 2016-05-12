angular.module('app.controllers')

.controller('TimeToLeaveController', function ($rootScope, $scope, $state, storage) {
	// get the users' calendars from the storage and listen to updates
	$scope.calendars = storage.getCalendars();
    retrieveLeaveData();

	storage.subscribe($scope, function onStorageUpdated() {
		$scope.calendars = storage.getCalendars();
        retrieveLeaveData();
		$scope.$apply();
        console.log($scope.calendars);
	});

    $scope.goToIndex = function(index){
        if (index === 0 ){
            $state.go('carStatus');
        } else {
            $state.go('timeline');
        }
    }

    function retrieveLeaveData() {
        $scope.parents = [];

        for (var i = 0; i < $scope.calendars.length; i++) {
            var calendar = $scope.calendars[i];

            // set the user data
            var parent = {
                picture : calendar.picture,
                nextEvent : "",
                transit : []
            };

            // find the next event for the user
            var nextEvent = {
                msecsUntilStart : -1,
                event : null
            };
            var now = new Date();
            calendar.events.forEach(function(event) {
                var msecsUntilEvent = (event.start - now);
                if (msecsUntilEvent < 0) return; // we dont want events that are already over
                if (nextEvent.msecsUntilStart == -1 || nextEvent.msecsUntilStart > msecsUntilEvent) {
                    nextEvent.msecsUntilStart = msecsUntilEvent;
                    nextEvent.event = event;
                }
            });

            // retrieve transit information for the next event
            if (nextEvent.event != null) {
                parent.nextEvent = nextEvent.event.title;
                if (nextEvent.event.optimized_transit != undefined) {
                    // new Date(oldDateObj.getTime() + diff*60000);
                    var timeToLeaveBest = new Date(nextEvent.event.start.getTime() + nextEvent.event.optimized_transit.best.duration *60000);

                    var timeToLeaveSecondBest = new Date(nextEvent.event.start.getTime() + nextEvent.event.optimized_transit.alternative.duration *60000);
                    parent.transit = [
                      {
                          type : nextEvent.event.optimized_transit.best.name,
                          minutesLeft : Math.round((timeToLeaveBest - now)/1000/60)
                      },
                        {
                          type : nextEvent.event.optimized_transit.alternative.name,
                          minutesLeft : Math.round((timeToLeaveSecondBest - now)/1000/60)
                      }

                    ];
                } 
            } else {
                parent.nextEvent = '- No more events today -';
            }

            $scope.parents.push(parent);
        };
    };

	/*$scope.parents = [
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
    ];*/
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
            nextEvent: 'Template Event',
			picture: 'img/child1.jpg'
        }
    ];

    $scope.$on("$ionicView.enter", function(event, data){
        $rootScope.handleCounterClockwise = function(){
            $state.go('carStatus');
        };

        $rootScope.handleClockwise = function(){
            $state.go('timeline');
        };
    });
});