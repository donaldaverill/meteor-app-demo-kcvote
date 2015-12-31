Template.stats.helpers({
  centerLat() {
    return EsriMap.center.get() && EsriMap.center.get().lat.toFixed(4);
  },
  centerLon() {
    return EsriMap.center.get() && EsriMap.center.get().lon.toFixed(4);
  },
  zoomLevel() {
    return EsriMap.zoomLevel.get();
  },
  visibleLayers() {
    return EsriMap.visibleLayers.get();
  }
});
