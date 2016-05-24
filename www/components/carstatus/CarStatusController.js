angular.module('app.controllers')

    .controller('CarStatusController', function ($scope, $state, $rootScope, $ionicViewSwitcher, $ionicNativeTransitions, storage, leds) {
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
            leds.toggleFlash();
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

        $scope.$on("$ionicView.leave", function(event, data){
            leds.toggleFlash();
        });


        $scope.getMap = function () {
            if ( $scope.carSimulatorData['location'] == 'Home' ) { return 'car-info-map car-info-map-home';}
            else if ( $scope.carSimulatorData['location'] == 'School' ) { return 'car-info-map car-info-map-school';}
            else if ( $scope.carSimulatorData['location'] == 'Work' ) { return 'car-info-map car-info-map-work';}
        }
    });