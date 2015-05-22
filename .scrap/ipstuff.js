'use strict';
HTTP.get('http://api.ipify.org', function (error, result) {
  if (!error) {
    console.log('twizzled', result);
    HTTP.get('http://www.telize.com/geoip/' + result.content,
      function (error,
        result) {
        console.log('grizzled', result);
        console.log(result.data.longitude,
          result.data.latitude);
        EsriMap.map.centerAndZoom(new EsriMap.Point(
          result.data.longitude,
          result.data.latitude), 13);
      });
  }
});
var apiCall = function (apiUrl, callback) {
  // try…catch allows you to handle errors

  try {
    var response = HTTP.get(apiUrl).data;
    // A successful API call returns no error
    // but the contents from the JSON response
    callback(null, response);
  } catch (error) {
    // If the API responded with an error message and a payload
    var errorCode, errorMessage;
    if (error.response) {
      errorCode = error.response.data.code;
      errorMessage = error.response.data.message;
      // Otherwise use a generic error message
    } else {
      errorCode = 500;
      errorMessage = 'Cannot access the API';
    }
    var myError = new Meteor.Error(errorCode, errorMessage);
    callback(myError, null);
  }
};

Meteor.methods({
  'geoJsonForIp': function (ip) {
    // avoid blocking other method calls from the same client
    this.unblock();
    var apiUrl = 'http://www.telize.com/geoip/' + ip;
    // asynchronous call to the dedicated API calling function
    var response = Meteor.wrapAsync(apiCall)(apiUrl);
    return response;
  }
});
