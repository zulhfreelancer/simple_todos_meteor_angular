Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {

  // use username instead of email address for user registration
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  // This code only runs on the client
  angular.module('simple-todos',['angular-meteor']);
 
  angular.module('simple-todos').controller('TodosListCtrl', ['$scope', '$meteor',
    function ($scope, $meteor) {
 
      // Sort task list by date
      $scope.tasks = $meteor.collection(function() {
        // To make Meteor understand Angular bindings and the other way around,
        // we use `$scope.getReactively` function that turns Angular scope variables
        // into Meteor reactive variables.
        return Tasks.find($scope.getReactively('query'), { sort: { createdAt: -1 } });
      });

      $scope.addTask = function (newTask) {
        $scope.tasks.push( {
          text: newTask,
          createdAt: new Date(),              // current time
          owner: Meteor.userId(),             // _id of logged in user
          username: Meteor.user().username }  // username of logged in user
        );
      };

      $scope.$watch('hideCompleted', function() {
        if ($scope.hideCompleted)
          $scope.query = {checked: {$ne: true}};
        else
          $scope.query = {};
      });

      $scope.incompleteCount = function () {
        return Tasks.find({ checked: {$ne: true} }).count();
      };
 
  }]);
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
