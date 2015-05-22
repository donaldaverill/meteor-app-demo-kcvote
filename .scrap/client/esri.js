/* jshint -W020 */
EsriMap = {
  center: new ReactiveVar(null)
};
Template.esriMap.onCreated(function () {
  'use strict';
  var self = this;
  require([
      'esri/map',
      'esri/layers/ArcGISTiledMapServiceLayer',
      'esri/layers/ArcGISDynamicMapServiceLayer',
      'esri/layers/ImageParameters',
      'esri/geometry/Extent',
      'esri/SpatialReference',
      'esri/tasks/locator',
      'esri/geometry/Point',
      'esri/geometry/Multipoint',
      'esri/tasks/IdentifyTask',
      'esri/tasks/IdentifyParameters',
      'esri/layers/FeatureLayer',
      'esri/layers/LabelLayer',
      'esri/Color',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/TextSymbol',
      'esri/renderers/SimpleRenderer',
      'dojo/dom',
      'dojo/on',
      'dojo/domReady!'
    ],
    function (Map,
      Tiled,
      ArcGISDynamicMapServiceLayer,
      ImageParameters,
      Extent,
      SpatialReference,
      Locator,
      Point,
      Multipoint,
      IdentifyTask,
      IdentifyParameters,
      FeatureLayer,
      LabelLayer,
      Color,
      SimpleLineSymbol,
      SimpleFillSymbol,
      TextSymbol,
      SimpleRenderer,
      dom,
      on) {
      EsriMap.SpatialReference = SpatialReference;
      EsriMap.IdentifyParameters = IdentifyParameters;
      EsriMap.Extent = Extent;
      EsriMap.IdentifyTask = IdentifyTask;
      EsriMap.Point = Point;

      EsriMap.map = new Map('map', {
        sliderOrientation: 'horizontal'
      });
      EsriMap.map.on('load', initOperationalLayer);

      var mapExtentChange = EsriMap.map.on("extent-change", function (evt) {
        EsriMap.center.set({
          lat: evt.extent.getCenter().getLatitude(),
          lon: evt.extent.getCenter().getLongitude()
        });
      });
      EsriMap.locator = new Locator(
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/Address_Points_locator/GeocodeServer'
      );
      var tiles = [
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/KingCo_GenericBase/MapServer'
        //'http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps' +
        //'/KingCo_Aerial_2009/MapServer',
        //'http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps' +
        //'/KingCo_Aerial_Overlay/MapServer'
      ];
      _.each(tiles, function (tile) {
        EsriMap.map.addLayer(new Tiled(tile));
      });
      EsriMap.map.on('load', initOperationalLayer);

      var mapExtentChange = EsriMap.map.on("extent-change", function (evt) {
        Session.set('center', {
          lat: evt.extent.getCenter().getLatitude(),
          lon: evt.extent.getCenter().getLongitude()
        });
      });

      console.log('map Loaded', EsriMap.map);

      var electoralURL =
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Districts' +
        '/KingCo_Electoral_Districts/MapServer';

      var imageParameters = new ImageParameters();
      imageParameters.format = 'jpeg'; //set the image type to PNG24,
      // note default is PNG8.

      //Takes a URL to a non cached map service.
      /*var electoral = new ArcGISDynamicMapServiceLayer(electoralURL, {
        'opacity': 0.5,
        'imageParameters': imageParameters,
        'visibleLayers': [
          0,
          1,
          2,
          3,
          4
        ]
      });*/
      //      electoral.setVisibleLayers([0, 1, 2, 3, 4]);
      //map.addLayer(electoral);



      function initOperationalLayer() {
        var fl = new FeatureLayer(
          'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
          'Districts/KingCo_Electoral_Districts/MapServer/0', {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            maxAllowableOffset: calcOffset()
          });
        on(EsriMap.map, 'onZoomEnd', function () {
          fl.setMaxAllowableOffset(calcOffset());
          console.log('onZoomEnd');
        });


        function calcOffset() {
          return (EsriMap.map.extent.getWidth() / EsriMap.map.width);
        }
        EsriMap.map.addLayer(fl);

        var labelField = 'NAME';

        var statesColor = new Color('#666');
        var statesLine = new SimpleLineSymbol('solid', statesColor, 1.5);
        var statesSymbol = new SimpleFillSymbol('solid', statesLine,
          null);
        var statesRenderer = new SimpleRenderer(statesSymbol);
        // create a feature layer to show country boundaries

        fl.setRenderer(statesRenderer);
        EsriMap.map.addLayer(fl);

        // create a text symbol to define the style of labels
        var statesLabel = new TextSymbol().setColor(statesColor);
        statesLabel.font.setSize('14pt');
        statesLabel.font.setFamily('arial');
        var statesLabelRenderer = new SimpleRenderer(statesLabel);
        var labels = new LabelLayer({
          id: 'labels'
        });
        // tell the label layer to label the countries feature layer
        // using the field named 'admin'
        labels.addFeatureLayer(fl, statesLabelRenderer, '{' +
          labelField + '}');
        // add the label layer to the map
        EsriMap.map.addLayer(labels);
      }

      /*var addresspointURL =
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/' +
        'KingCo_AddressPoints/MapServer';
      var addresspoint = new ArcGISDynamicMapServiceLayer(addresspointURL);
      EsriMap.map.addLayer(addresspoint);
      console.log('addresspoint', addresspoint, addresspoint.fullExtent);

      EsriMap.locator = new Locator(
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/' +
        'Address_Points_locator/GeocodeServer'
      );

      var address = {
        'Single Line Input': '400 Broad St Seattle, WA 98109'
      };
      var params = {
        address: address
      };

      EsriMap.locator.outSpatialReference = new SpatialReference({
        wkid: 102100
      });
      //console.log('locator ', locator);
      //locator.outSpatialReference = map.spatialReference;
      EsriMap.locator.addressToLocations(params, function (
        addressCandidates) {
        console.log('addressCandidates', addressCandidates);
        _.each(addressCandidates,
          function (addressCandidate) {
            console.log('addressCandidate', addressCandidate);
            EsriMap.map.centerAndZoom(new Point(addressCandidate.location
              .x,
              addressCandidate.location.y, addressCandidate.location
              .spatialReference
            ), 15);
            var identifyParams = new IdentifyParameters();
            var identifyTask = new IdentifyTask(electoralURL);

            identifyParams.geometry = new Point(addressCandidate.location
              .x,
              addressCandidate.location.y, addressCandidate.location
              .spatialReference
            );
            identifyParams.tolerance = 0;
            identifyParams.layerIds = [];
            identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            //identifyParams.returnGeometry = true;47.7316255,-122.3524502
            identifyParams.mapExtent = new Extent(
              addressCandidate.location.x,
              addressCandidate.location.y,
              addressCandidate.location.x,
              addressCandidate.location.y,
              addressCandidate.location.spatialReference);
            identifyTask.execute(identifyParams, function (
              idResults) {
              console.log(idResults, event);
            });
            //map.centerAndZoom(grr.getCenter(), 9);
            //map.setZoom(6);
          });
      });*/
    });
});
Template.esriMap.onRendered(function () {
  'use strict';
  var self = this;
  var data = Template.currentData();
  console.log('Esri Loaded', data);

  if (!data.name) {
    throw new Meteor.Error('EsriMaps - Missing argument: name');
  }
  if ($.isEmptyObject(data.options)) {
    throw new Meteor.Error('EsriMaps - Missing argument: options');
  }
  if (!(data.options instanceof Object)) {
    throw new Meteor.Error(
      'EsriMaps - options argument is not an object');
  }
});
