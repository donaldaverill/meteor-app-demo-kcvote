
  this.map;
  this.locator;

  require([
      "esri/map", "esri/layers/ArcGISTiledMapServiceLayer",
      "esri/layers/ArcGISDynamicMapServiceLayer",
      "esri/layers/ImageParameters", "esri/geometry/Extent",
      "esri/SpatialReference",
      "esri/tasks/locator",
      "esri/geometry/Point",
      "esri/geometry/Multipoint",
      "dojo/domReady!"
    ],
    function (Map,
      Tiled,
      ArcGISDynamicMapServiceLayer,
      ImageParameters,
      Extent,
      SpatialReference,
      Locator,
      Point,
      Multipoint) {
      var startExtent = new Extent(-13695476.636745225, 5945000, -
        13428342.473594017, 6092852.852381072, new esri.SpatialReference({
          wkid: 102100
        }));

      map = new Map("map", {
        sliderOrientation: "horizontal",
        center: new Point(-13560687.240565702, 6015302.236792026, new SpatialReference({
          wkid: 102100
        })),
        zoom: 9
      });

      var tiles = [
        "http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/KingCo_GenericBase/MapServer",
        //"http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/KingCo_Aerial_2009/MapServer",
        //"http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/KingCo_Aerial_Overlay/MapServer"
      ];
      _.each(tiles, function (tile) {
        var tiled = new Tiled(tile);
        map.addLayer(tiled);
      });
      var electoralURL =
        "http://gismaps.kingcounty.gov/ArcGIS/rest/services/Districts/KingCo_Electoral_Districts/MapServer";
      var imageParameters = new ImageParameters();
      imageParameters.format = "jpeg"; //set the image type to PNG24, note default is PNG8.

      //Takes a URL to a non cached map service.
      var electoral = new ArcGISDynamicMapServiceLayer(electoralURL, {
        "opacity": 0.5,
        //"imageParameters": imageParameters,
        "visibleLayers": [4]
      });
      //      electoral.setVisibleLayers([0, 1, 2, 3, 4]);
      map.addLayer(electoral);

      var addresspointURL =
        "http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/KingCo_AddressPoints/MapServer";
      addresspoint = new ArcGISDynamicMapServiceLayer(addresspointURL);
      map.addLayer(addresspoint);


      locator = new Locator(
        "http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/Address_Points_locator/GeocodeServer"
      );

      var address = {
        "Single Line Input": "500 N 142nd st. 98133"
      };
      var params = {
        address: address,
        searchExtent: map.extent
      };

      locator.outSpatialReference = map.spatialReference;
      //locator.outSpatialReference = map.spatialReference;
      locator.addressToLocations(params, function (addressCandidates) {
        console.log('addressCandidates', addressCandidates);
        _.each(addressCandidates, function (addressCandidate) {
          console.log('addressCandidate', addressCandidate.address);
          map.centerAt(new Point(addressCandidate.location.x,
            addressCandidate.location.y, map.spatialReference
          ));
          //map.centerAndZoom(grr.getCenter(), 9);
          //map.setZoom(9);
        });
      });




    });
