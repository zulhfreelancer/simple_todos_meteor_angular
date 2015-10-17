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
 
      $scope.$meteorSubscribe('tasks');

      $scope.tasks = $meteor.collection(function() {
        // To make Meteor understand Angular bindings and the other way around,
        // we use `$scope.getReactively` function that turns Angular scope variables
        // into Meteor reactive variables.
        return Tasks.find($scope.getReactively('query'), { sort: { createdAt: -1 } });
      });

      $scope.addTask = function (newTask) {
        $meteor.call('addTask', newTask);
      };

      $scope.deleteTask = function (task) {
        $meteor.call('deleteTask', task._id);
      };
 
      $scope.setChecked = function (task) {
        $meteor.call('setChecked', task._id, task.checked);
      };

      $scope.setPrivate = function (task) {
        // if the to do is currently private (true), toggle it to become public (false)
        // if the to do is currently public (false), toggle it to become private (true)
        $meteor.call('setPrivate', task._id, !task.private);
        //console.log(task.private);
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
  Meteor.publish('tasks', function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
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
    var task = Tasks.findOne(taskId);
    if (task.owner == Meteor.userId()) {
      Tasks.remove(taskId);
    } else {
      alert("You're not allowed to delete this to do.");
    }

  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.owner == Meteor.userId()) {
      Tasks.update(taskId, { $set: { checked: setChecked} });
    } else if (task.owner !== Meteor.userId()) {
      console.log("You're not allowed to set this as checked.");
    }
  },
  setPrivate: function (taskId, setToPrivate) {
    //console.log(setToPrivate);
    // private  = true
    // public   = false
    var task = Tasks.findOne(taskId);
 
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});