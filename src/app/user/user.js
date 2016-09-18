angular.module('starter.controllers')
.controller('UserCtrl', function($scope, $rootScope, postReq,  AuthService, $q, EmailService, $location, API_ENDPOINT, DEBUG, $routeParams, $parse) {

      // This is the fail callback from the login method
    var fbLoginError = function(error){
      console.log('fbLoginError', error);
      //$ionicLoading.hide();
    };

    $scope.user = {is_admin:"false"};

    $scope.signup = function() {

        $scope.errorList = [];

        var fieldState = {username: 'VALID', email: 'VALID', password: 'VALID'};

        if($scope.signUpForm.email.$error.required || !$scope.signUpForm.email){
            fieldState.email = 'The email is required.';
        } else if ($scope.signUpForm.email.$error.pattern){
            fieldState.email = 'The email is invalid.';
        }

        if($scope.signUpForm.username.$error.required || !$scope.signUpForm.username){
            fieldState.username = 'The username is required.';
        }

        if($scope.signUpForm.password.$error.required || !$scope.signUpForm.password){
            fieldState.password = 'The password is required.';
        }

        for (var fieldName in fieldState) {
            var message = fieldState[fieldName];
            var serverMessage = $parse('signUpForm.'+fieldName+'.$error.serverMessage');

            if (message == 'VALID') {
                $scope.signUpForm.$setValidity(fieldName, true, $scope.signUpForm);
                serverMessage.assign($scope, undefined);
            }
            else {

                $scope.signUpForm.$setValidity(fieldName, false, $scope.signUpForm);
                serverMessage.assign($scope, fieldState[fieldName]);

                $scope.errorList.push(fieldState[fieldName]);
            }
        }

        console.log($scope.errorList);

        if ($scope.errorList.length == 0) {
            AuthService.register($scope.user).then(function(msg) {
                if(DEBUG.isEnabled)
                    console.log(msg)
                $location.path('/sign-in');
            }, function(errMsg) {
            });
        }

    };


    $scope.fbLoginBrowser = function () {
        openFB.login(
        function (response) {
          if (response.status === 'connected') {
            console.log('Facebook login succeeded');
              
              if (!response.authResponse){
                  console.log("Cannot find the authResponse");
              }
              else{

                  var authResponse = response.authResponse;
                  $scope.getFacebookProfileInfo(authResponse, function (data) {
                          if(data.id != null){
                              AuthService.loginFacebook({
                                      userID: data.id,
                                      name: data.name,
                                      email: data.email,
                                      picture : "http://graph.facebook.com/" + data.id + "/picture?type=large"
                              }).then(function(msg) {
                                      AuthService.startupAuthenticate();
                                      $rootScope.getInfo();
                                      $location.path('/')
                                  }, function(errMsg) {
                              });
                          }
                          else {
                              console.log('No facebook profile info')
                          }
                  });
              }

          } else {
            alert('Facebook login failed');
          }
        },{scope: 'public_profile,email,publish_actions,user_friends'})
    };


    $scope.login = function() {
      AuthService.login($scope.user).then(function(msg) {
          AuthService.startupAuthenticate();
          $rootScope.getInfo();
          $location.path('/')
      }, function(errMsg) {
          console.log(errMsg);
      });
    };

    //This method is executed when the user press the "Login with facebook" button
    $scope.facebookSignIn = function() {
        $scope.fbLoginBrowser();
    };

    $scope.logout = function() {
      AuthService.logout();
    };

    $scope.newPwd = function() {
        AuthService.newPwd($scope.user, $routeParams.token).then(function(msg) {
        }, function(errMsg) {
        });
    };
    
    $scope.forgotpwd = function() {
        EmailService.resetPwd($scope.user).then(function(result) {
        }, function(result) {
            if(result.success)
            $location.path('/login')
        });
    };

});
