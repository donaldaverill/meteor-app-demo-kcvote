Template.modal.helpers({
  addresses() {
    return EsriMap.addresses.get();
  }
});

Template.modal.events({
  'click button'(event, template) {
    EsriMap.setMapToAddress(this);
    $('[data-modal]').closeModal();
  }
});
