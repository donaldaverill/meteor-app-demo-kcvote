'use strict';
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });
  //ESRI = new Esri();
  Template.hello.created = function () {
    console.log('hello template created');
  };
  Template.hello.rendered = function () {
    var self = this;
    Esri.initialize();
    self.autorun(function () {
      console.log('Esri initialized', Esri.initialized());
      // if the api has loaded
      if (Esri && Esri.initialized()) {
        console.log('made it');
        require([
          'esri/map',
          'esri/layers/LabelLayer',
          'dojo/domReady!'
        ], function (Map, LabelLayer) {
          console.log('requre worked', Map, LabelLayer);
        });
        /*
                Esri.loadModules(
                  [
                    'esri/layers/LabelLayer',
                    'esri/map',
                    'esri/layers/ArcGISTiledMapServiceLayer',
                    'esri/layers/ArcGISDynamicMapServiceLayer',
                    'esri/layers/ImageParameters',
                    'esri/geometry/Extent',
                    'esri/SpatialReference',
                    'esri/geometry/Point',
                    'esri/geometry/Multipoint',
                    'esri/layers/FeatureLayer',
                    'esri/Color',
                    'esri/symbols/SimpleLineSymbol',
                    'esri/symbols/SimpleFillSymbol',
                    'esri/symbols/TextSymbol',
                    'esri/renderers/SimpleRenderer',
                    'esri/tasks/IdentifyParameters',
                    'esri/tasks/IdentifyTask',
                    'esri/tasks/locator',
                    'dojo/dom',
                    'dojo/on',
                    'dojo/domReady!'
                  ]);*/
      }
    });
    /*
        self.autorun(function () {
          console.log('Esri loaded', Esri.loaded());
          if (Esri && Esri.loaded()) {
            console.log(Esri, Esri.map);
            var map = new Esri.map('map', {
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
              map.addLayer(new Esri.ArcGISTiledMapServiceLayer(tile));
            });
            map.on('load', initOperationalLayer);

            var initOperationalLayer = function () {
              var fl = new Esri.FeatureLayer(
                'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
                'Districts/KingCo_Electoral_Districts/MapServer/0', {
                  mode: Esri.FeatureLayer.MODE_ONDEMAND,
                  outFields: ['*'],
                  maxAllowableOffset: calcOffset()
                });
              Esri.on(map, 'onZoomEnd', function () {
                fl.setMaxAllowableOffset(calcOffset());
              });

              function calcOffset() {
                return (map.extent.getWidth() / map.width);
              }
              map.addLayer(fl);

              var labelField = 'NAME';

              var statesColor = new Esri.Color('#666');
              var statesLine = new Esri.SimpleLineSymbol('solid',
                statesColor,
                1.5);
              var statesSymbol = new Esri.SimpleFillSymbol('solid',
                statesLine,
                null);
              var statesRenderer = new Esri.SimpleRenderer(statesSymbol);
              // create a feature layer to show country boundaries

              fl.setRenderer(statesRenderer);
              map.addLayer(fl);

              // create a text symbol to define the style of labels
              var statesLabel = new Esri.TextSymbol().setColor(statesColor);
              statesLabel.font.setSize('14pt');
              statesLabel.font.setFamily('arial');
              var statesLabelRenderer = new Esri.SimpleRenderer(statesLabel);
              var labels = new Esri.LabelLayer({
                id: 'labels'
              });
              // tell the label layer to label the countries feature layer
              // using the field named 'admin'
              labels.addFeatureLayer(fl, statesLabelRenderer, '{' +
                labelField + '}');
              // add the label layer to the map
              map.addLayer(labels);
            };
          }
        });*/
  };
  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
