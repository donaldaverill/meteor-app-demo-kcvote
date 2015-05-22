
  /*var Socrata = Meteor.npmRequire('node-socrata');
  var config = {
    // find a hostDomain from the listSource method
    hostDomain: 'https://data.kingcounty.gov',
    // An accessible API table from the host domain
    resource: 'j2sw-exum',
    // Create account and register app https://opendata.socrata.com
    XAppToken: process.env.SOCRATA_APP_TOKEN || 'I1QHAeABdogBl9KRJ3lsMHBfW'
  };

  var soda = new Socrata(config);

  soda.get(function(err, response, data) {
    console.log('err', err);
    console.log('response', response);
    console.log('data', data);*/


  var Geoservices = Meteor.npmRequire('geoservices');

  var client = new Geoservices();
  client.geocode({
    text: "98133"
  }, function(err, result) {
    if (err) {
      console.error("ERROR: " + err);
    } else {
      console.log("Found it at " + result.locations[0].feature.geometry.y + ", " + result.locations[0].feature.geometry.x);
      console.log(result.locations[0]);
    }
  });

  var service = new client.featureservice({
    url: 'http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/Address_Points_locator/GeocodeServer'
  }, function(err, result) {
    if (err) {
      console.error("ERROR: " + err);
    } else {
      console.log("Got the FeatureService Metadata: ", result);
    }
  });
