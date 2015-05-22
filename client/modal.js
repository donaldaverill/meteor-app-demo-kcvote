'use strict';
Template.modal.helpers({
  addresses: function () {
    return EsriMap.addresses.get();
  }
});

Template.modal.events({
  'click button': function (event, template) {
    EsriMap.setMapToAddress(this);
    $('[data-modal]').closeModal();
  }
});
