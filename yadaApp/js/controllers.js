(function(app) {
  'use strict';

  var mainCtrl = function ($scope, YadaAPI, Utils) {
    $scope.reminders = [];
    $scope.dt = new Date();

    $scope.getReminders = function(formData) {
      $scope.formData = formData;
      YadaAPI.reminders.get().then(populate, function(err) {console.log(err);});
    };

    var populate = function(resp) {
      var data = resp.data;
      var schoolName = $scope.formData.schoolName;
      var groupedReminders = (Utils.groupBy(data, 'timeframe'));
      $scope.groups = [];
      for (var i = 0; i < groupedReminders.length; i++) {
        var group = {};
        group.name = Utils.formatDate(Utils.calcDate(groupedReminders[i].name, $scope.formData.dt));
        group.members = [];
        for (var j = 0; j < groupedReminders[i].members.length; j++) {
          var reminder = {};
          var current = groupedReminders[i].members[j];
          reminder.date = Utils.formatDate(Utils.calcDate(current.timeframe, $scope.formData.dt));
          reminder.fullName = current.fullName;
          reminder.message = Utils.parseVars(current.message, schoolName, reminder.date);
          reminder.detail = Utils.parseVars(current.detail, schoolName, reminder.date);
          group.members.push(reminder);
        }
        $scope.groups.push(group);
      }

    };

    $scope.format = 'M/d/yyyy';
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function() {
      $scope.dt = null;
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.minDate = new Date();
  };

  var adminCtrl = function($scope, $modal, YadaAPI) {
    $scope.test = 'test data';
    
    $scope.getReminders = function() {
      YadaAPI.reminders.get().then(populate, function(err) {console.log(err);});

      function populate(resp) {
        var data = resp.data;
        var reminders = [];
        for (var i = 0; i < data.length; i++) {
          var reminder = {};
          var current = data[i];
          reminder._id = current._id;
          reminder.name = current.name;
          reminder.message = current.message;
          reminder.detail = current.detail;
          reminder.lateMessage = current.lateMessage;
          reminder.lateDetail = current.lateDetail;
          reminder.category = current.category;
          reminder.timeframe = current.timeframe + '-day';
          reminders.push(reminder);
        }
        $scope.reminders = reminders;
      }
    };

    $scope.openAddModal = function () {
      
      var modalInstance = $modal.open({
        templateUrl: 'templates/modals/admin.reminders.add.html',
        controller: 'modalAdminReminderAdd'
      });
      
      modalInstance.result.then(function () {
        $scope.reminders = [];
        $scope.getReminders();
      });
    };
    $scope.getReminders();
  };

  var modalAdminReminderAdd = function($scope, $modalInstance, YadaAPI) {
    
    $scope.save = function(newReminder) {
      console.log('saved');
      YadaAPI.reminders.post(newReminder).then(function(res){
        $modalInstance.close();
      }, function(err){console.log('error saving reminder', err);});
    };

    $scope.cancel = function () {
      console.log('canceled');
      $modalInstance.dismiss('cancel');
    };

  };

  app.controller('mainCtrl', ['$scope', 'YadaAPI', 'Utils', mainCtrl]);
  app.controller('adminCtrl', ['$scope', '$modal', 'YadaAPI', adminCtrl]);
  app.controller('modalAdminReminderAdd', ['$scope', '$modalInstance', 'YadaAPI', modalAdminReminderAdd]);
}(angular.module("yadaApp")));
