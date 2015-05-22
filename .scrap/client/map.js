'use strict';
Template.map.onRendered(function () {
  var map, locator;
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

      map = new Map('map', {
        sliderOrientation: 'horizontal'
      });

      var tiles = [
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/' +
        'KingCo_GenericBase/MapServer'
        //'http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps' +
        //'/KingCo_Aerial_2009/MapServer',
        //'http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps' +
        //'/KingCo_Aerial_Overlay/MapServer'
      ];
      _.each(tiles, function (tile) {
        map.addLayer(new Tiled(tile));
      });

      var electoralURL =
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Districts' +
        '/KingCo_Electoral_Districts/MapServer';

      var imageParameters = new ImageParameters();
      imageParameters.format = 'jpeg'; //set the image type to PNG24,
      // note default is PNG8.

      //Takes a URL to a non cached map service.
      var electoral = new ArcGISDynamicMapServiceLayer(electoralURL, {
        'opacity': 0.5,
        'imageParameters': imageParameters,
        'visibleLayers': [
          0,
          1,
          2,
          3,
          4
        ]
      });
      //      electoral.setVisibleLayers([0, 1, 2, 3, 4]);
      //map.addLayer(electoral);

      map.on('load', initOperationalLayer);

      function initOperationalLayer() {
        var fl = new FeatureLayer(
          'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
          'Districts/KingCo_Electoral_Districts/MapServer/0', {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            maxAllowableOffset: calcOffset()
          });
        on(map, 'onZoomEnd', function () {
          fl.setMaxAllowableOffset(calcOffset());
        });

        function calcOffset() {
          return (map.extent.getWidth() / map.width);
        }
        map.addLayer(fl);

        var labelField = 'NAME';

        var statesColor = new Color('#666');
        var statesLine = new SimpleLineSymbol('solid', statesColor, 1.5);
        var statesSymbol = new SimpleFillSymbol('solid', statesLine,
          null);
        var statesRenderer = new SimpleRenderer(statesSymbol);
        // create a feature layer to show country boundaries

        fl.setRenderer(statesRenderer);
        map.addLayer(fl);

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
        map.addLayer(labels);
      }

      var addresspointURL =
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/' +
        'KingCo_AddressPoints/MapServer';
      var addresspoint = new ArcGISDynamicMapServiceLayer(addresspointURL);
      map.addLayer(addresspoint);
      console.log('addresspoint', addresspoint, addresspoint.fullExtent);

      locator = new Locator(
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/' +
        'Address_Points_locator/GeocodeServer'
      );

      var address = {
        'Single Line Input': '400 Broad St Seattle, WA 98109'
      };
      var params = {
        address: address
      };

      locator.outSpatialReference = new SpatialReference({
        wkid: 102100
      });
      //console.log('locator ', locator);
      //locator.outSpatialReference = map.spatialReference;
      locator.addressToLocations(params, function (addressCandidates) {
        console.log('addressCandidates', addressCandidates);
        _.each(addressCandidates, function (addressCandidate) {
          console.log('addressCandidate', addressCandidate);
          map.centerAndZoom(new Point(addressCandidate.location.x,
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
      });
    });
});
