Template.deviceControl.onCreated(function() {
  this.autorun(() => {
    if (useDevice() && geoReady()) {
      EsriMap.runPointInfo(
        new EsriMap.Point(geoLocation().lng, geoLocation().lat)
      );
    }
  });
});

Template.deviceControl.events({
  'click [data-action=choose-device-location]'(event, template) {
    EsriMap.deviceOrAddress.set('device');
  }
});

const useDevice = () => {
  return EsriMap.deviceOrAddress.get() === 'device';
};

const geoReady = () => {
  return Geolocation.latLng();
};

const geoLocation = () => {
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
  isSelected() {
    return EsriMap.deviceOrAddress.get() === 'device' ? 'orange' : 'grey';
  }
});
