
var app = angular.module('starterApp', ['ngMaterial','ngSanitize', 'ngRoute','ngMessages','angularUtils.directives.dirPagination']);

app.factory('socket',function(){
  var socket = io.connect('http://localhost:3000');
  return socket;
});

app.config(function($routeProvider,paginationTemplateProvider){
	
	  
	  paginationTemplateProvider.setPath('dirPagination.tpl.html');
	  //paginationTemplateProvider.setString('testTemplate.tpl.html');
      $routeProvider          
          .when('/',{
                templateUrl: 'home.html'
          })
	        .when('/testing',{
                templateUrl: 'pagination_tests.html'
          })
          .when('/note_field',{
                templateUrl: 'note_field.html'
          })
          .when('/create',{
                templateUrl: 'create.html'
          })
          .when('/note_deduce',{
                templateUrl: 'note_deduction.html'
          })
          .when('/view',{
                templateUrl: 'view.html'
          });
});
/*
app.provider("pollDataPProvider", function pollDataPProvider() { 
  var polls;
  return {
    setType: function (value) {
      polls= value;
    },
    $get: function () {
      return polls;
    }
  };
});

app.config("pollDataPProvider",function (pollDataPProvider) {
  pollDataPProvider.setType(null);
}]);

*/
app.controller('DialogController',function($mdDialog,$scope,pollData){
   $scope.listData = pollData;
   $scope.checkedanswer = {
      "a": false,
      "b": false,
      "c": false,
      "d": false,
   }
   $scope.clickChecked = function($index) {
      var value = !$scope.checkedanswer['abcdefghijklmnopqrstuvwxyz'[$index]];
      $scope.checkedanswer['abcdefghijklmnopqrstuvwxyz'[$index]] = value;  
   }
   $scope.answer = function($event){
     console.log($scope.checkedanswer);
     $mdDialog.hide();
   //  console.log($scope.formData.index0);
   //  console.log($scope.formData.index1);
   //  console.log($scope.formData.index2);
   //  console.log($scope.formData.index3);
   }
   
 });

app.controller('paginationController',function($http,$scope,$mdDialog){
  

  $scope.currentPage = 1;
  $scope.pageSize = 10;  
  $scope.categories = [
     'multiple choice',
     'variable deduce',
     'classic notes'
  ];
 
  getAllDeduceData();
  getAllPollsData();
  getAllNoteData();
  
  $scope.openPollDialog = function(poll,ev) {
    
    //var templateStr = prePollTemplate(poll);
    
    $mdDialog.show({
      controller: 'DialogController',
      templateUrl: 'dialog-result-example-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        pollData : poll        
      }
    });
  
  }

  $scope.openDeduceDialog = function(deduce,ev) {
    
    var templateStr = preDeduceTemplate(deduce);
    $mdDialog.show(
       $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title(deduce.subject)
          .htmlContent(templateStr)
          .ok('Got it!')
          .targetEvent(ev)
    );          
  }

  function preDeduceTemplate($scope) {
    var deduce = '';
    var i;
    var deducelength = Number($scope["length"]);

    for (i=0;i<deducelength;i++){
       var order = i + 1;
       deduce = deduce + '<div><p>' + order + '.  ' + $scope.deduces[i].item +'</p><br></div>';
    }
  
    

    return deduce +
           ' <div><br><p> ' + $scope.question +  '</p><br></div>' +           
           ' <div class="objective" ><br><h4><I>' +
                  $scope.objective +
               '</h4></i></div>';
           
  }  
  
  function getAllDeduceData() {
    $http.get("/deduce").success(function(response){
      $scope.allDeduceData = response.data;
    });
  }
  function getAllPollsData() {
    $http.get("/polls").success(function(response){
      $scope.allPollData = response.data;
    });
  }
  function getAllNoteData() {
    $http.get("/note").success(function(response){
      $scope.allNoteData = response.data;
    });
  }
    
  $scope.pageChangeHandler = function(num) {
      console.log('Page changed to ' + num);
  };
});

app.controller('pollingController',function($scope,$mdDialog,$http,socket) {
  
   $scope.itemscope = [];
   var items = [];
   $scope.$watch(
    function (scope) { 
      return scope.formData.pollQuestionLength; 
    },
    function (newValue, oldValue, scope) {
       scope.$evalAsync(
         function( scope ) {
            changeView(newValue);    
       });
      
    }
  ); 
  
  function changeView(newValue){
    items = [];
    var index_length;
    for (index_length=0;index_length<newValue;index_length++){
         var index = index_length+1;
         var option = "option" + index.toString();
         var modelOption = "formData.deduceOption" + index.toString();
         items = items.concat([{name:option,model:modelOption}]);
    } 
    
    $scope.itemscope = items;  
       
  } 
 
  $scope.questiontypes = [
    {value: '0', viewValue: 'Summative/Rank/Grade(Parametric Inferential)'},
    {value: '1', viewValue: 'Benchmark/Interim(Descriptive Inferential/FeatureBased/observe-expected vs population)'},
    {value: '2', viewValue: 'Formative/Explanative(independent/predictor vs. dependant/response/not context free'}
  ];
  $scope.pollData = [];
  $scope.formData = {};
  $scope.voteData = {};
  $scope.hiddenrows = [];
  $scope.ind = '';

  getPollData();
  function getPollData() {
    $http.get("/polls").success(function(response){
      $scope.pollData = response.data;
    });
  }

 
  function getDeduceData() {
    $http.get("/deduce").success(function(response){
      $scope.allDeduceData = response.data;
    });
  }

  $scope.submitNote = function(ev) { 
    var data = {
        "question" : $scope.formData.pollQuestion,
        "key" : $scope.formData.pollQuestionKey,
        "subject"  : $scope.formData.pollQuestionSubject,
        "objective": $scope.formData.pollQuestionObjective	
      };
    var message = {"title" : "", "message" : ""};
    $http.post('/note',data).success(function(response) {
      if(response.responseCode === 0) {
        message.title = "Success !";
        message.message = "Poll is successfully created";
        data["id"] = response.data.generated_keys[0];
        $scope.pollData.push(data);
      } else {
        message.title = "Error !";
        message.message = "There is some error happened creating poll";
      }
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title(message.title)
          .textContent(message.message)
          .ok('Got it!')
          .targetEvent(ev)
      );
    });  
  }
  
  $scope.submitDeduce = function(ev) {
  getDeduceData();
  var id_num = ($scope.allDeduceData.length + 1).toString();
  var data = {
        "id" : id_num,
        "question" : $scope.formData.pollQuestion,
        "length" : $scope.formData.pollQuestionLength,
        "subject"  : $scope.formData.pollQuestionSubject,
        "objective": $scope.formData.pollQuestionObjective
      }
      var items = [];
      var length = 0;
      for (length = 0; length < data.length; length++) {
          serial = length + 1;
          items = items.concat([{"item":$scope.formData["formData.deduceOption"+serial]}]);
      }
      data["deduces"]=items;
     
    var message = {"title" : "", "message" : ""};
    $http.post('/deduce',data).success(function(response) {
      if(response.responseCode === 0) {
        message.title = "Success !";
        message.message = "Poll is successfully created";
        data["id"] = id_num;
        $scope.pollData.push(data);
      } else {
        message.title = "Error !";
        message.message = "There is some error happened creating poll";
      }
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title(message.title)
          .textContent(message.message)
          .ok('Got it!')
          .targetEvent(ev)
      );
    });
  }
  
  $scope.submitPoll = function(ev) {
    console.log($scope.formData);
    var data = {
      "question" : $scope.formData.pollQuestion,
      "scenario" : $scope.formData.pollQuestionScenario,
      "subject"  : $scope.formData.pollQuestionSubject,
      "objective": $scope.formData.pollQuestionObjective,  
      "polls" : [{
        "option" : $scope.formData.pollOption1, "vote" : 0
      },{
        "option" : $scope.formData.pollOption2, "vote" : 0
      },{
        "option" : $scope.formData.pollOption3, "vote" : 0
      },{
        "option" : $scope.formData.pollOption4, "vote" : 0
      }],
      "answer"   : $scope.formData.pollAnswer,
      "distractor":$scope.formData.pollDistractor,
      "type"      :$scope.formData.pollType,
    };
    var message = {"title" : "", "message" : ""};
    $http.post('/polls',data).success(function(response) {
      if(response.responseCode === 0) {
        message.title = "Success !";
        message.message = "Poll is successfully created";
        data["id"] = response.data.generated_keys[0];
        $scope.pollData.push(data);
      } else {
        message.title = "Error !";
        message.message = "There is some error happened creating poll";
      }
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title(message.title)
          .textContent(message.message)
          .ok('Got it!')
          .targetEvent(ev)
      );
    });
  }
 
  socket.on('changeFeed',function(data) {
    for(var pollCounter = 0 ;pollCounter < $scope.pollData.length; pollCounter++) {
      if($scope.pollData[pollCounter].id === data.id) {
        $scope.pollData[pollCounter].polls = data.polls;
        $scope.$apply();
      }
    }
  });
});
/*
app.service('pollDataService', ["$scope", pollData])
.factory('pollData', ["$scope", function($scope) {
  return $scope.polls;
}]);
*/
/*
app.config(['$provide','$scope', function($provide) {
  $provide.factory('pollData', function() {
    var pollData = $scope.polls;
    // factory function body that constructs shinyNewServiceInstance
    return pollData;
  });
}]); */

