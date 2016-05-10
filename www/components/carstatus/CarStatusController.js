angular.module('app.controllers')

    .controller('CarStatusController', function ($scope, storage) {
        // get the users' carSimulatorData from the storage and listen to updates
        $scope.carSimulatorData = storage.getCarSimulatorData();

        storage.subscribe($scope, function onStorageUpdated() {
            $scope.carSimulatorData = storage.getCarSimulatorData();
            $scope.$apply();
            console.log("carSimulatorData: " + JSON.stringify($scope.carSimulatorData));
        });
    });