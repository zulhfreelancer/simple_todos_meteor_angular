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

Meteor.methods({
  // we use this methods after we remove `insecure` package
  // so that we can check if user is loggen in before `insert`, `update` and `remove`
  // any record in database
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});