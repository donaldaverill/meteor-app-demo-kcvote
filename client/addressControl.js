Template.addressControl.helpers({
  useAddress,
  isSelected() {
    return EsriMap.deviceOrAddress.get() === 'address' ? 'orange' : 'grey';
  }
});

const useAddress = () => {
  return EsriMap.deviceOrAddress.get() === 'address';
};

Template.addressControl.events({
  'submit, click [data-action=choose-address-location]'(event, template) {
    event.preventDefault();
    if (!template.$('[data-input=address]').val()) {
      Materialize.toast('Please Enter an address!', 3500);
      return;
    }
    EsriMap.locator = new EsriMap.Locator(
      'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/' +
      'Address_Points_locator/GeocodeServer'
    );

    const params = {
      address: {
        'Single Line Input': template.$('[data-input=address]').val()
      }
    };

    EsriMap.locator.outSpatialReference = new EsriMap.SpatialReference({
      wkid: EsriMap.map.spatialReference.wkid
    });

    EsriMap.locator.addressToLocations(params, (addressCandidates) => {
        addressCandidates = _.filter(addressCandidates, (addressCandidate) => {
          return addressCandidate.score > 40;
        });
        if (addressCandidates.length === 0) {
          Materialize.toast('No address found.', 3500);
        } else if (addressCandidates.length === 1) {
          EsriMap.setMapToAddress(addressCandidates[0]);
        } else if (addressCandidates.length > 1) {
          EsriMap.addresses.set(addressCandidates);
          $('[data-modal]').openModal();
        }
      });
  }
});
