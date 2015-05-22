'use strict';
Template.map.onCreated(function () {
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
      'esri/dijit/Popup',
      'esri/layers/FeatureLayer',
      'esri/layers/LabelLayer',
      'esri/Color',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/TextSymbol',
      'esri/renderers/SimpleRenderer',
      'dojo/dom',
      'dojo/dom-construct',
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
      Popup,
      FeatureLayer,
      LabelLayer,
      Color,
      SimpleLineSymbol,
      SimpleFillSymbol,
      TextSymbol,
      SimpleRenderer,
      dom,
      domConstruct,
      on) {

      EsriMap.FeatureLayer = FeatureLayer;
      EsriMap.SpatialReference = SpatialReference;
      EsriMap.IdentifyParameters = IdentifyParameters;
      EsriMap.Extent = Extent;
      EsriMap.IdentifyTask = IdentifyTask;
      EsriMap.Point = Point;
      EsriMap.Locator = Locator;
      EsriMap.Color = Color;
      EsriMap.SimpleRenderer = SimpleRenderer;
      EsriMap.SimpleFillSymbol = SimpleFillSymbol;
      EsriMap.SimpleLineSymbol = SimpleLineSymbol;
      EsriMap.TextSymbol = TextSymbol;
      EsriMap.LabelLayer = LabelLayer;
      EsriMap.Popup = Popup;
      EsriMap.on = on;

      var popup = new Popup({
        fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0]), 2), new Color([255, 255, 0,
            0.25
          ]))
      }, domConstruct.create("div"));

      EsriMap.map = new Map('map', {
        sliderOrientation: 'horizontal',
        center: [-121.77515409216302,
          47.434674437283064
        ],
        zoom: 9,
        infoWindow: popup
      });

      var tiles = [
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/' +
        'KingCo_GenericBase/MapServer'
      ];
      _.each(tiles, function (tile) {
        EsriMap.map.addLayer(new Tiled(tile));
      });
      EsriMap.map.on('load', function () {
        for (var i = 0; i < 1; i++) {
          EsriMap.addFeatureLayer('baseLayer',
            'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
            'Districts/KingCo_Electoral_Districts/MapServer/' + i);
        }
        //EsriMap.zoomLevel.set(EsriMap.map.getZoom());
      });
      EsriMap.map.on('extent-change',
        function (evt) {
          EsriMap.center.set({
            lat: evt.extent.getCenter().getLatitude(),
            lon: evt.extent.getCenter().getLongitude()
          });
          EsriMap.visibleLayers.set(EsriMap.map.getLayersVisibleAtScale());
        });
      EsriMap.map.on('zoom-end', function (evt) {
        EsriMap.zoomLevel.set(evt.level);
      });
      EsriMap.map.on('click', function (evt) {
        EsriMap.deviceOrAddress.set(null);
        EsriMap.runPointInfo(evt.mapPoint);
      });

      //function initOperationalLayer() {

      //EsriMap.visibleLayers.set(EsriMap.map.getLayersVisibleAtScale());
      /*EsriMap.locator = new Locator(
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/' +
        'Address_Points_locator/GeocodeServer'
      );
      var identifyParams = new IdentifyParameters();
      var electoralURL =
        'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Districts' +
        '/KingCo_Electoral_Districts/MapServer';
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
      });*/
      //}
    }
  );
});

EsriMap.runPointInfo = function (point) {
  var electoralURL =
    'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Districts' +
    '/KingCo_Electoral_Districts/MapServer';
  var identifyParams = new EsriMap.IdentifyParameters();
  var identifyTask = new EsriMap.IdentifyTask(electoralURL);

  identifyParams.geometry = point;
  identifyParams.tolerance = 0;
  identifyParams.layerIds = [];
  identifyParams.layerOption = EsriMap.IdentifyParameters.LAYER_OPTION_ALL;
  identifyParams.mapExtent = new EsriMap.Extent(
    point.x,
    point.y,
    point.x,
    point.y,
    point.spatialReference);
  identifyTask.execute(identifyParams, function (
    idResults) {
    var message = '';
    _.each(idResults, function (result) {
      message = message + '<b>' + result.layerName +
        '</b> : ' + result.value + '<br>';
    });
    EsriMap.map.infoWindow.setContent(message);
    EsriMap.map.infoWindow.resize(400, 250);
    EsriMap.map.infoWindow.show(point);
    EsriMap.map.centerAndZoom(point, 15);
  });
};

EsriMap.addFeatureLayer = function (id, url) {
  var fl = new EsriMap.FeatureLayer(
    url, {
      id: id,
      mode: EsriMap.FeatureLayer.MODE_ONDEMAND,
      outFields: ['*'],
      maxAllowableOffset: calcOffset()
    });
  EsriMap.map.on('zoom-end', function (evt) {
    setMaxOffset(fl);
    //EsriMap.visibleLayers.set(EsriMap.map.getLayersVisibleAtScale());
  });

  var labelField = 'NAME';

  var statesColor = new EsriMap.Color('#666');
  var statesLine = new EsriMap.SimpleLineSymbol('solid', statesColor, 1.5);
  var statesSymbol = new EsriMap.SimpleFillSymbol('solid', statesLine,
    null);
  var statesRenderer = new EsriMap.SimpleRenderer(statesSymbol);
  // create a feature layer to show country boundaries

  fl.setRenderer(statesRenderer);
  EsriMap.map.addLayer(fl);

  var statesLabel = new EsriMap.TextSymbol().setColor(statesColor);
  statesLabel.font.setSize('14pt');
  statesLabel.font.setFamily('arial');
  var statesLabelRenderer = new EsriMap.SimpleRenderer(statesLabel);
  var labels = new EsriMap.LabelLayer({
    id: 'labels'
  });
  // tell the label layer to label the countries feature layer
  // using the field named 'admin'
  labels.addFeatureLayer(fl, statesLabelRenderer, '{' +
    labelField + '}');
  // add the label layer to the map
  EsriMap.map.addLayer(labels);
  EsriMap.visibleLayers.set(EsriMap.map.getLayersVisibleAtScale());
};

function setMaxOffset(fl) {
  fl.setMaxAllowableOffset(calcOffset());
}

function calcOffset() {
  return (EsriMap.map.extent.getWidth() / EsriMap.map.width);
}
