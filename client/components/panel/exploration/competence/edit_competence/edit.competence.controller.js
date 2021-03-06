(function(){
	/*
	* BaseMap Module
	*/
	'use strict';

	function EditLayerCompetenceController($scope, $mdDialog, $mdToast, $interval, $timeout, $document, FileUploader, layer_id, CompetenceService, BaseMapFactory){
	
		
		var uploader = $scope.uploader = new FileUploader({
			queueLimit: 1,
			isUploading: true
		});
		
		uploader.filters.push({
			name: 'updateImageFilter',
			fn: function(item, options) {
				if (item.type === "image/png") {
					if (uploader.queue[0]) {
						if (uploader.queue[0]._file.type === item.type) {
							_showToastMessage('Removiendo ' + uploader.queue[0]._file.name);
							uploader.removeFromQueue(uploader.queue[0]);
							return true;
						}
					}
					else {
						return true;
					}
				}
				else {
					return _showToastMessage('Icono o marker no válido');
				}
			}
		});
		
		uploader.onAfterAddingFile = function(item) {
			_validateImage(item);
		}
		
		var _validateImage = function(file) {
			$scope.validatingImage = true;
			var fileType = file._file.type;

			$timeout(function(){
				if (fileType === "image/png") {
					_showToastMessage('Icono válido');
					$scope.iconName = uploader.queue[0].file.name;
				}
				$scope.validatingImage = false;
			}, 2500);
		}
		
		uploader.updateFields = function(validForm, updateData) {
			var pin = uploader.queue;
			var icon = null;
			var idLayer = layer_id;
			var competenceName = null;
			var formData = new FormData();
			if (uploader.queue.length !== 0) {
				if (uploader.queue.length === 1 && uploader.queue[0]._file.type === "image/png") {
					icon = pin[0]._file
					formData.append('pin', icon);
				}
			}
			if (updateData) {
				competenceName = updateData.nm;
				formData.append('nom', competenceName);
			}

			CompetenceService.updatCompetenceVar( formData, idLayer )
			.then(function(data){
				if (data.status === 200) {
					var updated_values = "";
					if (uploader.queue.length !== 0 && !updateData) {
						updated_values = {icon: pin[0].file.name, id_l: idLayer, success: true}
					}
					else if(uploader.queue.length !== 0 && updateData) {
						updated_values = {icon: pin[0].file.name, nom: updateData.nm, id_l: idLayer, success: true}
					}
					else if(uploader.queue.length === 0 && updateData) {
						updated_values = {nom: updateData.nm, id_l: idLayer, success: true}
					}
					else {
						updated_values = {nom: "", icon: "", success: false}
					}
					
					$mdDialog.hide(updated_values);
					uploader.clearQueue();
				}
				BaseMapFactory.updateLocationID(idLayer);
				if (data.status === 200) {
					$mdDialog.hide(true);
				}
			}, function(error){
				console.log(error)
			});
		}

		/**
		 * [_showToastMessage Function to show toast messages]
		 * @param  {[type]} message [Message to show in $mdDialog]
		 */
		var _showToastMessage = function(message) {
			$mdToast.show(
				$mdToast.simple({
					textContent: message,
					position: 'top right',
					hideDelay: 2500,
					parent: $document[0].querySelector('.md-dialog-container')
				})
			);
		}
		
		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

	};

	EditLayerCompetenceController.$inject = ['$scope', '$mdDialog', '$mdToast', '$interval', '$timeout', '$document', 'FileUploader', 'layer_id', 'CompetenceService', 'BaseMapFactory'];

	angular.module('walmex').controller('EditLayerCompetenceController', EditLayerCompetenceController);

})();
