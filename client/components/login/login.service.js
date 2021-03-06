(function(){
	/*
	* Login Service
	*/
	'use strict';
	
	function loginService($q, $http, $httpParamSerializer, baseUrl){
		var deferred = null,
		_loginRequest = null,
		_signupRequest = null,
		_signupdata = null,
		_userType = null,
		_email = null,
		_username = null,
		_password = null,
		_grant_type = "password",
		_client_id = null,
		_client_secret = null,
		_data = null,
		_session = null;

		this.loginRequest = function(data){
			deferred = $q.defer();
			_username = data.user;
			_password = md5(data.password);
			_client_id = md5(_username);
			_client_secret = sha256(_password).substr(0,40);
			_data = {username: _username, password: _password, grant_type: _grant_type, client_id: _client_id, client_secret: _client_secret};
			
			_loginRequest = $http({
				url: baseUrl + '/oa/accesstk',
				method: 'POST',
				data: $httpParamSerializer(_data),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
				}
			});

			_loginRequest.then(function(result){
				deferred.resolve(result);
			}, function(error){
				deferred.reject(error);
			});
			return deferred.promise;
		};
		
		this.signupRequest = function(data){
			deferred = $q.defer();
			_email = data.email;
			_username = data.user;
			_password = md5(data.password);
			_userType = 'uA';
			_signupdata = {u: _username, p: _password, ml: _email, tu: _userType};
			
			_signupRequest = $http({
				url: baseUrl + '/oa/register',
				method: 'POST',
				data: $httpParamSerializer(_signupdata),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
				}
			});

			_signupRequest.then(function(result){
				deferred.resolve(result);
			}, function(error){
				deferred.reject(error);
			});
			return deferred.promise;
		};

	}
	loginService.$inject = ['$q', '$http', '$httpParamSerializer', 'baseUrl'];
	angular.module('walmex').service('loginService', loginService);

})();
