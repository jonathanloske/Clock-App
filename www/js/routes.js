angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('timeToLeaveOverview', {
    url: '/timetoleave',
    templateUrl: 'components/timetoleave/timetoleave.html',
    controller: 'TimeToLeaveController'
  })

  .state('timeline', {
    url: '/timeline',
    templateUrl: 'components/timeline/timeline.html',
    controller: 'TimelineController'
  })

  .state('carStatus', {
    url: '/carstatus',
    templateUrl: 'components/carstatus/carstatus.html',
    controller: 'CarStatusController'
  });

  $urlRouterProvider.otherwise('/timetoleave');

});