angular.module('app.controllers')

    .controller('CarStatusController', function ($scope, $state, $rootScope, $ionicViewSwitcher, $ionicNativeTransitions, storage) {
        // get the users' carSimulatorData from the storage and listen to updates
        $scope.carSimulatorData = storage.getCarSimulatorData();

        storage.subscribe($scope, function onStorageUpdated() {
            $scope.carSimulatorData = storage.getCarSimulatorData();
            $scope.$apply();
            console.log("carSimulatorData: " + JSON.stringify($scope.carSimulatorData));
        });

        $scope.goTo = function(){
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('timeToLeaveOverview');
        }


        $scope.$on("$ionicView.enter", function(event, data){
            $rootScope.handleCounterClockwise = function(){
            };

            $rootScope.handleClockwise = function(){
                // $state.go('timeToLeaveOverview');
                $ionicNativeTransitions.stateGo('timeToLeaveOverview', {}, {
                    "type": "slide",
                    "direction": "left"
                });
            }
        });
    });