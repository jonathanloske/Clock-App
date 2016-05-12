angular.module('app.controllers')

    .controller('CarStatusController', function ($scope, $state, $rootScope, storage) {
        // get the users' carSimulatorData from the storage and listen to updates
        $scope.carSimulatorData = storage.getCarSimulatorData();

        storage.subscribe($scope, function onStorageUpdated() {
            $scope.carSimulatorData = storage.getCarSimulatorData();
            $scope.$apply();
            console.log("carSimulatorData: " + JSON.stringify($scope.carSimulatorData));
        });

        $scope.goTo = function(){
            $state.go('timeToLeaveOverview');
        }


        $scope.$on("$ionicView.enter", function(event, data){
            $rootScope.handleCounterClockwise = function(){
            };

            $rootScope.handleClockwise = function(){
                $state.go('timeToLeaveOverview');
            }
        });
    });