angular.module('myApp', ['ui.router', 'myApp.controllers'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('login')
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: '/views/login.html',
      controller: 'loginController',
      controllerAs: 'login'
    })
    .state('home', {
      url: '/home',
      templateUrl: '/views/home.html',
      controller: 'homeController',
      controllerAs: 'home'
    })
    .state('sign_ups', {
      url: '/signup',
      templateUrl: '/views/sign_ups.html',
      controller: 'signupController',
      controllerAs: 'sign_ups'
    })
    .state('guest', {
      url: '/guest',
      templateUrl: '/views/guest.html',
      controller: 'guestController',
      controllerAs: 'guest'
    })
}])

// .controller('loginController', ['$http', function($http) {
//   console.log('this is the login controller');
// }])
//
//
// .controller('homeController', ['$http', function($http) {
//   console.log('this is the home controller');
// }])
