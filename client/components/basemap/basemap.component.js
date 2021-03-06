(function(){
	/*
	* BaseMap Module
	*/
	'use strict';

	var BaseMapController = function(_, $timeout,  $scope, BaseMapFactory, BaseMapService, UserFactory, Auth, $mdDialog, uiService){

		var _this = null,
		_access_token = null,
		_map = null,
		_label = null,
		_label_item = null,
		_ggl = null,
		_mapbox_streets = null,
		_mapbox_relieve = null,
		_mapbox_satellite = null,
		_google_roadmap = null,
		_google_satellite = null,
		_zoom_in = null,
		_zoom_out = null,
		_line_tool = null,
		_polygon_tool = null,
		_area_tool = null,
		_actions_tool = null,
		_edit_tool = null,
		_delete_tool = null,
		_drawControl = null,
		_drawType = null,
		_featureGroup = null,
		_colorLine = null,
		_autocomplete = null;

		_access_token = Auth.getToken();

		BaseMapService.map.then(function (map) {
			_mapFunctions(map);
		});

		var _mapFunctions = function(map){
			_google_roadmap = new L.Google('ROADMAP');
			_google_satellite = new L.Google();
			_mapbox_streets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + BaseMapService.accessToken, {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="http://mapbox.com">Mapbox</a>',
				id: BaseMapService.mapId
			});
			_mapbox_relieve = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + BaseMapService.accessToken, {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="http://mapbox.com">Mapbox</a>',
				id: 'caarloshugo1.lnipn7db'
			});
			_mapbox_satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + BaseMapService.accessToken, {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="http://mapbox.com">Mapbox</a>',
				id: 'mapbox.satellite'
			});

			/**
			 * [Add layers to custom control]
			 */
			map.addControl(new L.Control.Layers( {
				'Mapbox Streets': _mapbox_streets.addTo(map),
				'Mapbox Relieve': _mapbox_relieve,
				'Mapbox Satellite': _mapbox_satellite,
				'Google Roadmap': _google_roadmap,
				'Google Satellite': _google_satellite
			}, {}, { position: 'bottomright'}));

			/**
			 * [Set image name to each layer]
			 * @type {Array}
			 */
			var imagesArray = ['mapbox-streets', 'mapbox-relieve', 'mapbox-satellite', 'google-roadmap', 'google-satellite'];
			var layerToggle = angular.element(document.getElementsByClassName('leaflet-control-layers-toggle'));
			_label_item = angular.element(document.getElementsByClassName('leaflet-control-layers-base')).children();
			_label = angular.element(document.getElementsByClassName('leaflet-control-layers-toggle'));
			_label.text("");

			/**
			 * [Append image function to each layer item]
			 * @param  {[type]} item   [Label control layer item]
			 * @param  {String} index) [Index from each label control layer]
			 */
			_.forEach(_label_item, function(item, index) {
				angular.element(item).append('<img src="./images/switcher_map/'+imagesArray[index]+'.jpg" width="120"/>');
			});

			layerToggle.text("").append('<img src="./images/switcher_map/'+imagesArray[0]+'.jpg" width="120"/>');

			map.on('baselayerchange', function(e){
				console.log(e.name.toLowerCase().replace(' ', '-'))
				layerToggle.text("").append('<img src="./images/switcher_map/'+e.name.toLowerCase().replace(' ', '-')+'.jpg" width="120"/>');
			});


			_featureGroup = BaseMapService.featureGroup.addTo(map);
			_drawControl = BaseMapService.drawControl(_featureGroup);
			_drawControl.addTo(map);


			//USER SAVE ZOOM AND BOUNDS
			map.on('moveend zoomend', function (e) {
				UserFactory.saveMapView();
			});
			// map.on('zoomend', function (e) {
			// 	UserFactory.saveMapView();
			// });
			UserFactory.getMapView();

			map.on('draw:created', function (e) {
				_featureGroup.addLayer(e.layer);
			});

			_zoom_in = angular.element(document.getElementsByClassName('leaflet-control-zoom-in'));
			_zoom_in.text("");
			_zoom_in.append('<i class="demo demo-zoom-in leaflet-zoom-in"></i>');

			_zoom_out = angular.element(document.getElementsByClassName('leaflet-control-zoom-out'));
			_zoom_out.text("");
			_zoom_out.append('<i class="demo demo-zoom-out leaflet-zoom-out"></i>');

			_line_tool = angular.element(document.getElementsByClassName('leaflet-draw-draw-polyline'));
			_line_tool.text("");
			_line_tool.append('<i class="demo demo-line line-tool"></i>');

			_polygon_tool = angular.element(document.getElementsByClassName('leaflet-draw-draw-polygon'));
			_polygon_tool.text("");
			_polygon_tool.append('<i class="demo demo-area polygon-tool"></i>');

			_area_tool = angular.element(document.getElementsByClassName('leaflet-draw-draw-circle'));
			_area_tool.text("");
			_area_tool.append('<i class="demo demo-radio area-tool"></i>');

			_actions_tool = angular.element(document.getElementsByClassName('leaflet-draw-actions'));
			_actions_tool.text("");
			_actions_tool.css({
				display: "block",
				left: "0px",
				top: "40px"
			});

			_edit_tool = angular.element(document.getElementsByClassName('leaflet-draw-edit-edit'));
			_edit_tool.text("");
			_edit_tool.append('<i class="demo demo-edit edit-tool"></i>');

			_delete_tool = angular.element(document.getElementsByClassName('leaflet-draw-edit-remove'));
			_delete_tool.text("");
			_delete_tool.append('<i class="demo demo-delete delete-tool"></i>');
		};

		if (_access_token.ftueShowed === "0") {
			_firstTimeUser();
		}
		function _firstTimeUser() {
			$scope.ftue_bounds = null;
			$scope.ftue_nw = null;
			$scope.ftue_se = null;
			$scope.ftue_bbox = null;
			BaseMapService.map.then(function (map) {
				$scope.ftue_bounds = map.getBounds();
				$scope.ftue_nw = $scope.ftue_bounds.getNorthWest();
				$scope.ftue_se = $scope.ftue_bounds.getSouthEast();
				$scope.ftue_bbox = [$scope.ftue_nw.lng, $scope.ftue_se.lat, $scope.ftue_se.lng, $scope.ftue_nw.lat].join(',');
			});
			uiService.layerIsLoading();

			$timeout(function(){
				uiService.layerIsLoaded();
				$mdDialog.show({
					controller: 'FirstTimeUserController',
					templateUrl: './components/ftue/ftue.tpl.html',
					parent: angular.element(document.body),
					clickOutsideToClose:false,
					escapeToClose: false,
					locals: {
						ftue_bbox: $scope.ftue_bbox
					},
					preserveScope: false
				})
				.then(function(result){
					if (result.success === true && result.ftue_status === "completed") {
						console.log(result)
					}
				});
			}, 5000);

		}

		

		// _map.on('baselayerchange', function(e){
		// 	console.log(e)
		// 	if(e.name === "Google Roadmap"){
		// 		_drawControl.setDrawingOptions({
		// 		    polyline: {
		// 		        shapeOptions: {
		// 		            color: '#000000'
		// 		        }
		// 		    }
		// 		});
		// 	}
		// });
	};

	BaseMapController.$inject = ['_', '$timeout', '$scope', 'BaseMapFactory', 'BaseMapService','UserFactory', 'Auth', '$mdDialog', 'uiService'];

	angular.module('walmex').controller('BaseMapController', BaseMapController);

})();
