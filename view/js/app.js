var app = angular.module('starterApp', ['ngCookies','ngMaterial','ngSanitize', 'ngRoute','ngMessages','angularUtils.directives.dirPagination']);

app.factory('socket',function(){
  var socket = io.connect('http://localhost:3000');
  return socket;
});

app.service('SessionService', function(){
    var userIsAuthenticated = false;
    var username = "  LOGIN";
    this.setUserAuthenticated = function(value){
        userIsAuthenticated = value;
    };
    this.getUserAuthenticated = function(){
        return userIsAuthenticated;
    };
    this.setUsername = function(value){
        username = value;
    };
    this.getUsername = function(){
        return username;
    }
});

app.provider('SessionService', function () {
 var name = '';
 var username = '  LOGIN';
 var userIsAuthenticated = false;
 this.setName = function (newName) {
     name = newName;
 };

 this.setUsername = function(newUsername){
     username = newUsername;
 };
  
 this.getUsername = function(){
     return username;
 };

 this.getUserAuthenticated = function(){
     return userIsAuthenticated;
 };

 this.$get = function () {
   return {  getName:'',
             getUserAuthenticated: function(){
                return userIsAuthenticated;
             },
             getUsername : function(){
                console.log(username);
                return username;
             },
             setUsername : function(newUsername){
                username = newUsername;
             }
          };
 }});
/*
app.provider('SessionService', function () {
  var name = '';
  var userIsAuthenticated = false;
  this.setUserAuthenticated = function(value){
      userIsAuthenticated = value;
  };

  this.getUserAuthenticated = function(){
        return userIsAuthenticated;
    };

  this.$get = function () {
    return {
      name:'',
      getUserAuthenticated: this.getUserAuthenticated
    };
  };
});
*/
app.config(function(SessionServiceProvider,$routeProvider,paginationTemplateProvider,$cookiesProvider){
	
	  
	  paginationTemplateProvider.setPath('dirPagination.tpl.html');
	  //paginationTemplateProvider.setString('testTemplate.tpl.html');
    window.routes =
    {
       '/login': {
            templateUrl: 'home.html',
            requireLogin: false
       },

       '/create_vote': {
            templateUrl: 'create_vote.html', 
            requireLogin: true
       },

       '/view': {
            templateUrl: 'pagination_tests.html', 
            requireLogin: true
       },
       
       '/profile': {
            templateUrl: 'profile.html', 
            requireLogin: true
       },
        
       '/note_deduce': {
            templateUrl: 'note_deduction.html', 
            requireLogin: true
       }
    };
    
    for(var path in window.routes) {
        $routeProvider.when(path, window.routes[path]);
    }

    $routeProvider.otherwise({redirectTo: '/welcome'});

    

}).run(function($rootScope,SessionService,$cookies){
    if ($cookies.get("username") == null) {
          $rootScope.loginButton = "  LOGIN";
          $cookies.put("username","  LOGIN");
    } else {
          $rootScope.loginButton = $cookies.get("username");
    }
    //$rootScope.loginButton = $cookies.get("username");  
    $rootScope.loginIcon = "account_circle";
    $rootScope.$on("$locationChangeStart", function(event, next, current) {
        var user = $cookies.get("username");
        for(var i in window.routes) {
            if(next.indexOf(i) != -1) {
                if(window.routes[i].requireLogin && (user == '  LOGIN') ) {
                    alert("You need to be logged in to see this page!");
                    event.preventDefault();
                } else if (window.routes[i].requireLogin && !(user == '  admin') && (i=='/create_vote' || i=='/note_deduce')){
                    alert("You need to be admin to see this page!");
                    event.preventDefault();
                }
            }
        }
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
//

app.controller('DialogController',function($mdDialog,$scope,$timeout,pollData){
   var canvas;
   $timeout(function(){
      canvas = document.getElementById('canvas');
      var signaturePad = new SignaturePad(canvas);
      signaturePad.minWidth = 5;
      signaturePad.maxWidth = 10;
      signaturePad.penColor = "rgb(66, 133, 244)";
     

      signaturePad.toDataURL(); // save image as PNG

      //signaturePad.fromDataURL("data:image/png;base64");
 
      // Returns signature image as an array of point groups
      const data = signaturePad.toData();

      // Draws signature image from an array of point groups
      signaturePad.fromData(data);

      // Clears the canvas
      signaturePad.clear();

      // Returns true if canvas is empty, otherwise returns false
      signaturePad.isEmpty();

      // Unbinds all event handlers
      signaturePad.off();

      // Rebinds all event handlers
      signaturePad.on();
    }, 3000);

   
   
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
     'polling question',
     'multiple choice',
     'variable deduce',
     'classic notes'
  ];
 
  getAllDeduceData();
  getAllPollsData();
  getAllNoteData();
  getAllQuestionData();
  
  $scope.loginInit = function(){
      if ($cookies.get("username") == null) {
          $scope.loginButton = "  LOGIN";
      } else {
          $scope.loginButton = $cookies.get("username");
      }
  }

  $scope.openQuestionDialog = function(question,ev) {
	$mdDialog.show({
      controller: 'DialogController',
      templateUrl: 'question-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        pollData : question
      //  canvasData : angular.element(document.querySelectorAll("canvas"))        
      }
    });
  }
  
  $scope.openPollDialog = function(poll,ev) {
    
    //var templateStr = prePollTemplate(poll);
    
    $mdDialog.show({
      controller: 'DialogController',
      templateUrl: 'text-dialog.html',
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
    
  function getAllQuestionData() {
    $http.get("/question").success(function(response){
      $scope.allQuestionData = response.data;
    });
  }
  $scope.pageChangeHandler = function(num) {
      console.log('Page changed to ' + num);
  };
});

app.controller('pollingController',function(SessionService,$route,$scope,$mdDialog,$http,socket,$rootScope,$cookies) {
   console.log($rootScope);
  // console.log($state);
   /*$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
     if (toState.authenticate && !AuthService.isAuthenticated()){
      // User isn’t authenticated
       $state.transitionTo("login");
       event.preventDefault(); 
     }
   });*/

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
  

  function getAllUrlParams(url) {

  // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

     return obj;
  } 



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
 
  $scope.polltypes = [
    {value: '0', viewValue: 'Summative/Rank/Grade(Parametric Inferential)'},
    {value: '1', viewValue: 'Benchmark/Interim(Descriptive Inferential/FeatureBased/observe-expected vs population)'},
    {value: '2', viewValue: 'Formative/Explanative(independent/predictor vs. dependant/response/not context free'}
  ];
  
  
  $scope.questiontypes = [
    {value: '0', viewValue: 'Discovering existing environments and business processes'},
    {value: '1', viewValue: 'Discovering client expectations'},
    {value: '2', viewValue: 'Validating business requirements'},
	{value: '3', viewValue: 'Designing a solution architecture'},
    {value: '4', viewValue: 'Identifying components and templates for web pages'},
    {value: '5', viewValue: 'Creating migration strategies'},
	{value: '6', viewValue: 'Identifying and recommending performance requirements'},
	{value: '7', viewValue: 'Identifying and recommending a security model'},
    {value: '8', viewValue: 'Identifying quality assurance requirements and planning the QA process'},
    {value: '9', viewValue: 'Integrating with third-party systems'},
	{value: '10', viewValue: 'Managing the content editing process'},
	{value: '11', viewValue: 'Creating the development process'},
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
  

  function getQuestionData() {
    $http.get("/question").success(function(response){
      $scope.questionData = response.data;
    });
  }

 
  function getDeduceData() {
    $http.get("/deduce").success(function(response){
      $scope.allDeduceData = response.data;
    });
  }

  $scope.submitLogin = function(ev) {
    var data = {
      "email" : $scope.formData.loginEmail,
      "password"  : $scope.formData.password      
    };
    console.log(data);

    $http.post("/login",data).success(function(response) {
      $cookies.put("username","  "+getAllUrlParams("http://localhost:3000"+response).name);
      $rootScope.loginButton = $cookies.get("username");
      console.log($rootScope.loginButton);
      window.location.href = "http://localhost:3000"+response;
      /*

      if(response.responseCode === 0) {
       
        console.log($scope.email);
        message.title = "Success !";
        message.message = "Poll is successfully created";       
      } else {
        message.title = "Error !";
        message.message = "There is some error happened creating poll";
      };*/
     }); 
  }

  $scope.dbclkLogin = function(ev) {
    $cookies.put("username","  LOGIN");
    $rootScope.loginButton = $cookies.get("username");
    window.location.href =  "http://localhost:3000/#/login";
  }

  $scope.clkLogin = function(ev) {
    var locationUrl;
    if ($cookies.get("username") == "  LOGIN") {
       locationUrl = "http://localhost:3000/#/login";
    } else {
       locationUrl = "http://localhost:3000/#/profile?name=" + $cookies.get("username").slice(2);
    }; 
    window.location.href =  locationUrl;
  }

  $scope.submitSignup = function(ev) {
    var data = {
      "email" : $scope.formData.loginEmail,     
      "password"  : $scope.formData.password      
    };
    console.log(data);

    if ($scope.formData.password == $scope.formData.repeat) {
        $http.post("/signup",data).success(function(response) {
           $cookies.put("username","  "+getAllUrlParams("http://localhost:3000"+response).name);
           $rootScope.loginButton = $cookies.get("username");
           window.location.href = "http://localhost:3000"+response;
        });
    } else {
      console.log(signup);
    }
    /*

      if(response.responseCode === 0) {
       
        console.log($scope.email);
        message.title = "Success !";
        message.message = "Poll is successfully created";       
      } else {
        message.title = "Error !";
        message.message = "There is some error happened creating poll";
      };*/
  }; 
  

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
  
  $scope.submitQuestion = function(ev) {
    console.log($scope.formData);
	getQuestionData();
	var dataID; 
	if ($scope.questionData != null) {
		dataID = $scope.questionData.length + 1;
	} else {
		dataID = 1;
	}
    var data = {
      "question" : $scope.formData.pollQuestion,     
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
      "type"      :$scope.formData.questionType,
	  "answer"    :$scope.formData.pollAnswer,
	  "id"        :dataID
    };
    var message = {"title" : "", "message" : ""};
    $http.post('/question',data).success(function(response) {
      if(response.responseCode === 0) {
        message.title = "Success !";
        message.message = "Question is successfully created";
        //data["id"] = response.data.generated_keys[0];
       // $scope.questionData.push(data);
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

