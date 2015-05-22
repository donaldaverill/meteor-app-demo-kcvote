Meteor.startup(function() {
  // KCGIS Center 12/07/2010
  require(["esri/map", "esri/tasks/IdentifyTask", "esri/tasks/query",
    "dijit/form/Button", "dojox/grid/DataGrid", "dojo/data/ItemFileReadStore",
    "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
    "dojox/layout/ExpandoPane", "dojox/fx","esri/tasks/locator"
  ], init);
  /*dojo.addOnLoad(init);

  dojo.require("esri.map");
  dojo.require("esri.tasks.identify");
  dojo.require("esri.tasks.query");
  dojo.require("dijit.form.Button");
  dojo.require("dojox.grid.DataGrid");
  dojo.require("dojo.data.ItemFileReadStore");
  dojo.require("dijit.layout.BorderContainer");
  dojo.require("dijit.layout.ContentPane");
  dojo.require("dojox.layout.ExpandoPane");
  dojo.require("dojox.fx");*/


  var timer;
  var map;
  var resultsGrid, store;
  var tiledGenericBase, tiledHybridBase, tiledHybridBaseOverlay, dynamicAlerts;
  var tiledGenericBaseURL, tiledHybridBaseURL, tiledHybridBaseOverlayURL, dynamicAlertsURL;
  var locator, addresspoint, kcparcels, electoral;
  var locatorURL, addresspointURL, kcparcelsURL, electoralURL;
  var initExtent; //2/10/11

  var isGenericBaseLayerOn = true;
  var isHybridBaseLayerOn = false;
  var isHybridBaseOverlayLayerOn = false;
  var maponload_handler, locatorComplete_handler, windowResize_handler, maponClick_handler, infoWindowHide_handler, addOnUnload_handler;

  tiledGenericBaseURL = "http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/KingCo_GenericBase/MapServer";
  tiledHybridBaseURL = "http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/KingCo_Aerial_2009/MapServer";
  tiledHybridBaseOverlayURL = "http://gismaps.kingcounty.gov/ArcGIS/rest/services/BaseMaps/KingCo_Aerial_Overlay/MapServer";
  locatorURL = "http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/Address_Points_locator/GeocodeServer";

  addresspointURL = "http://gismaps.kingcounty.gov/ArcGIS/rest/services/Address/KingCo_AddressPoints/MapServer";
  kcparcelsURL = "http://gismaps.kingcounty.gov/ArcGIS/rest/services/Property/KingCo_Parcels/MapServer";
  electoralURL = "http://gismaps.kingcounty.gov/ArcGIS/rest/services/Districts/KingCo_Electoral_Districts/MapServer";
  //electoralURL = "http://kcgiscragsstage/ArcGIS/rest/services/Districts/KingCo_Electoral_Districts/MapServer"; //cragsstage 10.80.19.25, cragsdev 10.80.19.26

  Session.set('electoralURL', electoralURL);

  var symbol;
  var resultSymbol;
  var highlightSymbol;
  var polySymbol;

  // setup test for IE6
  var isIE6 = false;
  var is7up = false;
  if (dojo.isIE == 6) {
    isIE6 = true;
    dojo.byId("btnHybridBase").style.display = 'none';
  }

  function init(map) {
    console.log('Map', map);
    //   dojo.style(dojo.byId("loadingDiv"), "display", "block");

    console.log("init");

    esriConfig.defaults.map.slider = {
      left: "10px",
      top: "35px",
      width: null,
      height: "150px"
    };
    esriConfig.defaults.map.sliderLabel = {
      tick: 3,
      labels: null,
      style: "width:4em; font-family:Verdana; font-size:65%; color:#fff; padding-left:2px;"
    };
    // proxy page not supported
    // esriConfig.defaults.io.proxyUrl = "proxy/proxy.ashx";
    // esriConfig.defaults.io.alwaysUseProxy = false;

    // check for basemap passed through the URL
    var basemap = getURLParam('basemap');
    // check for extents passed through the URL
    var xmin = (parseFloat(getURLParam('xmin')));
    var ymin = (parseFloat(getURLParam('ymin')));
    var xmax = (parseFloat(getURLParam('xmax')));
    var ymax = (parseFloat(getURLParam('ymax')));

    if ((isNaN(xmin) == false) && (isNaN(ymin) == false) && (isNaN(xmax) == false) && (isNaN(ymax) == false)) {
      var startExtent = new esri.geometry.Extent(xmin, ymin, xmax, ymax, new esri.SpatialReference({
        wkid: 102100
      }));
    } else {
      // if no extents were passed in the URL, then use the full county extent
      var startExtent = new esri.geometry.Extent(-13695476.636745225, 5945000, -13428342.473594017, 6092852.852381072, new esri.SpatialReference({
        wkid: 102100
      }));
    }

    initExtent = startExtent;

    /*map = new esri.Map("map", {
      extent: startExtent,
      displayGraphicsOnPan: !dojo.isIE,
      logo: false
    });*/
    // NOTE:  Seems that if you connect to the onLoad AFTER you add map layers, it won't fire the map.onLoad even
    // in IE after you leave and return via the back button.
    maponload_handler = dojo.connect(map, "onLoad", initFunctionality);

    //set up and add the map services. ID's match the button names for base maps
    tiledGenericBase = new esri.layers.ArcGISTiledMapServiceLayer(tiledGenericBaseURL, {
      id: "Map"
    });
    map.addLayer(tiledGenericBase);

    tiledHybridBase = new esri.layers.ArcGISTiledMapServiceLayer(tiledHybridBaseURL, {
      id: "Aerial"
    });
    map.addLayer(tiledHybridBase);

    tiledHybridBaseOverlay = new esri.layers.ArcGISTiledMapServiceLayer(tiledHybridBaseOverlayURL, {
      id: "Hybrid"
    });
    tiledHybridBaseOverlay.hide();
    map.addLayer(tiledHybridBaseOverlay);

    addresspoint = new esri.layers.ArcGISDynamicMapServiceLayer(addresspointURL);
    map.addLayer(addresspoint);

    kcparcels = new esri.layers.ArcGISTiledMapServiceLayer(kcparcelsURL, {
      "opacity": 0.5
    });
    map.addLayer(kcparcels);

    electoral = new esri.layers.ArcGISDynamicMapServiceLayer(electoralURL);
    electoral.setVisibleLayers([0, 1, 2, 3, 4]); //update when district boundaries are updated. [1,2,3,4,16]
    map.addLayer(electoral);


    if (basemap !== "") {
      changeBaseMap(basemap);
    } else {
      changeBaseMap(tiledGenericBase);
    }
    locator = new esri.tasks.Locator(locatorURL);
    console.log(locator);
    locatorComplete_handler = dojo.connect(locator, "onAddressToLocationsComplete", showResults);

    // dojo.connect(window, "resize", dojo.hitch(resizeMap));
    // dojo.connect(document.getElementById('map'), "resize", dojo.hitch(resizeMap));
    dojo.connect(map, "onExtentChange", showExtent);


    addOnUnload_handler = dojo.addOnUnload(removeListeners);
    console.log("init end");
  }


  function initFunctionality(map) {
    console.log("initFunctionality start");
    initIdentify();
    //    initQuery();
    resultSymbol = new esri.symbol.SimpleMarkerSymbol();
    resultSymbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND);
    resultSymbol.setColor(new dojo.Color([0, 0, 255, 0.75]));

    highlightSymbol = new esri.symbol.SimpleMarkerSymbol();
    highlightSymbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE);
    highlightSymbol.setColor(new dojo.Color([255, 0, 0, 0.9]));

    polySymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.5]));
    dstSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 0.1), new dojo.Color([255, 255, 0, 0.5]));

    //districts boundary symbols
    kccdstSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 3);
    congdstSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 77, 168]), 2);
    legdstSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 168, 132]), 1);
    votedstSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 170, 0]), 1);
    seadstSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([168, 112, 0]), 1);

    maponClick_handler = dojo.connect(map, "onClick", function() {
      map.infoWindow.hide();
    });
    map.infoWindow.resize(350, 200); //(230,100)
    map.disableKeyboardNavigation();
    dojo.byId("resultsGrid").style.visibility = "hidden";
    map.addLayer(resultGraphicLayer);
    dojo.style(dojo.byId("loadingDiv"), "display", "none");
    resizeMap();

    console.log("initFunctionality end");
  }

  function ClearMap() {
    console.log("ClearMap start");
    map.graphics.clear();
    resultGraphicLayer.clear();

    document.getElementById('council2').innerHTML = "";
    document.getElementById('congressional2').innerHTML = "";
    document.getElementById('legislative2').innerHTML = "";
    document.getElementById('voting2').innerHTML = "";
    document.getElementById('seattle2').innerHTML = "";

    dojo.byId("btnClear").style.visibility = "hidden";
    ' clear the results grid'
    resultsGrid.setStore(null);
    dojo.byId("resultsGrid").style.visibility = "hidden";
    console.log("ClearMap end");

  }



  //function to get parameters passed in the URL
  function getURLParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
      return "";
    else
      return results[1];
  }

  function closeLinkDiv() {
    dojo.byId("linkDiv").style.display = "none";
  }

  function removeListeners() {
    console.log("removing listeners");
    try {
      // if you add a listener elsewhere in the app, add a line to remove it here
      // this function will be called when the document unloads.
      // Removing listeners prevents possible memory leaks
      dojo.disconnect(maponload_handler);
      dojo.disconnect(locatorComplete_handler);
      //    dojo.disconnect(windowResize_handler);
      dojo.disconnect(maponClick_handler);
      dojo.disconnect(infoWindowHide_handler);
      dojo.disconnect(addOnUnload_handler);
      dojo.disconnect(selectedGridMouseOver_handler);
      dojo.disconnect(selectedGridOut_handlerdojo);
      dojo.disconnect(selectedGridClick_handler);
    } catch (err) {
      console.log(err);
    }

  }

  function createURLForCurrentExtent() {
    var baseURL = document.location.host + document.location.pathname;
    var params = "?xmin=" + map.extent.xmin + "&ymin=" + map.extent.ymin + "&xmax=" + map.extent.xmax + "&ymax=" + map.extent.ymax;
    if (tiledGenericBase.visible === true) {
      params += "&basemap=Map"
    } else if (tiledHybridBaseOverlay.visible === true) {
      params += "&basemap=Hybrid"
    } else if (tiledHybridBase.visible === true) {
      params += "&basemap=Aerial"
    }
    if (map.infoWindow.isShowing) {
      params += "&" + selectedFeatureQuery;
    }
    //return extentURL;
    var extentURL = "http://" + baseURL + params;
    dojo.byId("txtLink").value = extentURL;
    dojo.byId("linkDiv").style.display = "block";
    return extentURL;
  }

  function changeBaseMap(baselayer) {
    switch (baselayer) {
      case tiledGenericBase:
      case "Map":
      case "map":
      default:
        tiledHybridBase.hide();
        tiledHybridBaseOverlay.hide();
        tiledGenericBase.show();
        setActiveButton("btnGenericBase")
        break;
      case tiledHybridBase:
      case "Aerial":
      case "aerial":
        tiledHybridBase.show();
        tiledHybridBaseOverlay.hide();
        tiledGenericBase.hide();
        setActiveButton("btnHybridBase");
        break;
      case tiledHybridBaseOverlay:
      case "Hybrid":
      case "hybrid":
        tiledHybridBase.show();
        if (isIE6) {
          tiledHybridBaseOverlay.hide();
          setActiveButton("btnHybridBase");
        } else {
          tiledHybridBaseOverlay.show();
          setActiveButton("btnHybridBaseOverlay");
        }
        tiledGenericBase.hide();
        break;
    }
  }

  function setActiveButton(buttonName) {
    // set up an array of your base map button IDs.
    if (isIE6) {
      var btnArray = ["btnGenericBase", "btnHybridBase"];
    } else {
      var btnArray = ["btnGenericBase", "btnHybridBase", "btnHybridBaseOverlay"];
    }

    dojo.forEach(btnArray, function(buttonName) {
      dojo.removeClass(buttonName, "baseMapButtonActive");
    });
    dojo.addClass(buttonName, "baseMapButtonActive");
  }

  function resizeMap() {
    console.log("resizeMap");
    map.reposition();
    map.resize();
  }

  function showExtent(extent) {
    var s = "";
    s = "XMin: " + extent.xmin + ", " + "YMin: " + extent.ymin + ", " + "XMax: " + extent.xmax + ", " + "YMax: " + extent.ymax;
    console.log("extent = " + s);
    //    console.log("level = " + map.getLevel());
  }

  //get extent of featureset(graphics)
  function getGraphicsExtent(graphics) {
    var geometry, extent, ext;
    dojo.forEach(graphics, function(graphic, i) {
      geometry = graphic.geometry;
      if (geometry instanceof esri.geometry.Point) {
        //converts a point object into an extent with a specified factor (using 1000 for state plane seems fine)
        ext = new esri.geometry.Extent(geometry.x - 1000, geometry.y - 1000, geometry.x + 1000, geometry.y + 1000, geometry.spatialReference);
      } else if (geometry instanceof esri.geometry.Extent) {
        ext = geometry;
      } else { //line, polygon
        ext = geometry.getExtent();
      }

      if (extent) {
        extent = extent.union(ext);
      } else {
        extent = new esri.geometry.Extent(ext);
      }
    });
    return extent;
  }

});
function showResults(candidates) {
  console.log("locator showResults start");
  var foundOne;
  var candidate;
  //    var infoTemplate = new esri.InfoTemplate("Location", "Address: ${address}<br />Score: ${score}<br /><br /><a href='#' name='${address}' onclick='addressSelect(this.name, ${x}, ${y})'>Select this address</a>");
  var infoTemplate = new esri.InfoTemplate("${address}", "Score: ${score}<br /><br /><a href='#' name='${address}' onclick='addressSelect(this.name, ${x}, ${y})'>Select this address</a>");
  map.infoWindow.resize(350, 150);

  var points = new esri.geometry.Multipoint(map.spatialReference);
  var zoomExt;

  foundOne = 0;
  var addressList = new Array();
  var items = [];
  console.log("new score = " + iScore);
  for (var i = 0, il = candidates.length; i < il; i++) {
    candidate = candidates[i];
    if (candidate.score > iScore) { //50
      addressList.push(candidate.address);

      console.log(candidate.address + "  " + candidate.cityname);
      console.log("XY = " + candidate.location.x + ", " + candidate.location.y);
      foundOne = foundOne + 1;

      //            var attributes = { address: candidate.address, score:candidate.score, x:candidate.location.x, y:candidate.location.y, location:candidate.location };
      var attributes = {
        id: foundOne,
        address: candidate.address,
        score: candidate.score,
        x: candidate.location.x,
        y: candidate.location.y,
        location: candidate.location
      };
      console.log("attributes.x = " + attributes.x);
      items.push(attributes);

      //            var graphic = new esri.Graphic(candidate.location, resultSymbol, attributes, infoTemplate);
      var graphic = new esri.Graphic(candidate.location, resultSymbol, attributes);

      // map.graphics.add(graphic);
      resultGraphicLayer.add(graphic);

      //			map.graphics.add(new esri.Graphic(candidate.location, new esri.symbol.TextSymbol(attributes.address).setOffset(0, 8)));
      map.graphics.add(new esri.Graphic(candidate.location)); //remove text 2/2/11
      points.addPoint(candidate.location);

      //Stop looping if score is 100 (assume highest score is processed first) 2/2/11
      if (candidate.score == 100) {
        break;
      }
    }
  }
  zoomExt = points.getExtent();
  console.log("zoomExt = " + zoomExt);

  //check if items has objects
  for (var index in items) {
    console.log(index + " : " + items[index].id + ", " + items[index].address + ", " + items[index].score);
  }


  //Create data object to be used in store
  var data = {
    identifier: "id", //This field needs to have unique values
    label: "id", //Name field for display. Not pertinent to a grid but may be used elsewhere.
    items: items
  };

  //Create data store and bind to grid.
  dojo.byId("resultsGrid").style.visibility = "visible";
  store = new dojo.data.ItemFileReadStore({
    data: data
  });
  resultsGrid.setStore(store);
  resultsGrid.setQuery({
    id: '*'
  });

  connectresultsGrid();

  console.log("foundOne= " + foundOne);
  //$('#count').text("Matching Address Count: " + foundOne);
  if (foundOne == 0) {
    alert("No addresses found");
  } else if (foundOne == 1) {
    var grr = points.getExtent();
    map.centerAndZoom(grr.getCenter(), 15); //10

    //        var centerX = grr.getCenter().x;
    //        var centerY = grr.getCenter().y;
    //        console.log("center x = " + centerX + ", center y = " + centerY);
    //        console.log("extent = " + showExtent(grr));
    //        centerX = centerX + 5000;
    //        centerY = centerY + 5000;
    //        map.centerAt(centerX, centerY);

    var addr = addressList[0];
    //        doQuery(addr);
    doIdentify(points, addr, initExtent); //zoomExtent??  <-- problem is extent here??
  } else {
    map.setExtent(points.getExtent().expand(1.5));

  }
  dojo.style(dojo.byId("loadingDiv"), "display", "none");
  console.log("showResults end");
}
