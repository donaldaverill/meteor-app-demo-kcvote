'use strict';
Template.stats.helpers({
  centerLat: function () {
    return EsriMap.center.get() && EsriMap.center.get().lat.toFixed(4);
  },
  centerLon: function () {
    return EsriMap.center.get() && EsriMap.center.get().lon.toFixed(4);
  },
  zoomLevel: function () {
    return EsriMap.zoomLevel.get();
  },
  visibleLayers: function () {
    return EsriMap.visibleLayers.get();
  }
});

Template.stats.events({
  'click': function (event, template) {
    /*EsriMap.addFeatureLayer('help_me1',
      'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
      'Districts/KingCo_Electoral_Districts/MapServer/1');
    EsriMap.addFeatureLayer('help_me2',
      'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
      'Districts/KingCo_Electoral_Districts/MapServer/2');
    EsriMap.addFeatureLayer('help_me3',
      'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
      'Districts/KingCo_Electoral_Districts/MapServer/3');
    EsriMap.addFeatureLayer('help_me4',
      'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
      'Districts/KingCo_Electoral_Districts/MapServer/4');
    EsriMap.addFeatureLayer('help_me5',
      'http://gismaps.kingcounty.gov/arcgis/rest/services/' +
      'Districts/KingCo_Electoral_Districts/MapServer/5');*/
  }
});
