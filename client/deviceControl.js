'use strict';
Template.deviceControl.onCreated(function () {
  this.autorun(function () {
    if (useDevice() && geoReady()) {
      EsriMap.runPointInfo(new EsriMap.Point(
        geoLocation().lng,
        geoLocation().lat));
    }
  });
});

Template.deviceControl.events({
  'click [data-action=choose-device-location]': function (event, template) {
    EsriMap.deviceOrAddress.set('device');
  }
});

var useDevice = function () {
  return EsriMap.deviceOrAddress.get() === 'device';
};

var geoReady = function () {
  return Geolocation.latLng();
};

var geoLocation = function () {
  // return 0, 0 if the location isn't ready
  return Geolocation.latLng() || {
    lat: 99999,
    lng: 99999
  };
};

Template.deviceControl.helpers({
  useDevice: useDevice,
  geoReady: geoReady,
  geoLocation: geoLocation,
  geoError: Geolocation.error,
  isSelected: function () {
    return EsriMap.deviceOrAddress.get() === 'device' ? 'orange' :
      'grey';
  }
});
