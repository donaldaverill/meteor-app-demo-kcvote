Template.hello.onRendered(function() {

  /**
   * @author Michael Jenkins, King County GIS Center
   * modified by Yuko Caras
   */
  var identifyTask = null;
  var identifyParams = null;
  var resultGraphicLayer = null;
  require(["esri/map", "esri/tasks/IdentifyTask", "esri/tasks/query",
    "dijit/form/Button", "dojox/grid/DataGrid", "dojo/data/ItemFileReadStore",
    "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
    "dojox/layout/ExpandoPane", "esri/tasks/IdentifyParameters", "dojox/fx"
  ], function() {

    identifyTask = new esri.tasks.IdentifyTask(Session.get('electoralURL'));
    identifyParams = new esri.tasks.IdentifyParameters();
    resultGraphicLayer = new esri.layers.GraphicsLayer({
      id: "resultGraphics"
    });
  });
  //dojo.require("esri.tasks.identify");
  console.log("identify page");

  var identifyParams;

  function initIdentify() {
    console.log("initidentify");
    maponClick_handler = dojo.connect(map, "onClick", doIdentifyDistricts); //dojo.connect(map, doIdentify);
    identifyParams.tolerance = 3;
    identifyParams.returnGeometry = false; //true - issue with return.  If true, return only 1 layer.
    identifyParams.layerIds = [0, 1, 2, 3, 4]; //1,2,3,4,16
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;

    map.infoWindow.resize(350, 200); //(300,100)
    map.infoWindow.setTitle("Electoral Districts");
    console.log("initidentify end");
  }

  //click map
  function doIdentifyDistricts(evt, addr) {
    console.log("doIdentifyDistricts, addr = " + addr);

    dojo.style(dojo.byId("loadingDiv"), "display", "block");

    //    $('#council2').text("");
    //    $('#congressional2').text("");
    //    $('#legislative2').text("");
    //    $('#voting').text("");
    document.getElementById('council2').innerHTML = "";
    document.getElementById('congressional2').innerHTML = "";
    document.getElementById('legislative2').innerHTML = "";
    document.getElementById('voting2').innerHTML = "";
    document.getElementById('seattle2').innerHTML = "";

    map.graphics.clear();
    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
    identifyTask.execute(identifyParams, function(idResults) {
      addToMapDistricts(idResults, evt);
    });
  }

  function addToMapDistricts(idResults, evt) {
    kccdstResults = {
      displayFieldName: null,
      features: []
    };
    congdstResults = {
      displayFieldName: null,
      features: []
    };
    legdstResults = {
      displayFieldName: null,
      features: []
    };
    votdstResults = {
      displayFieldName: null,
      features: []
    };
    seadstResults = {
      displayFieldName: null,
      features: []
    };
    var lyr = "";
    var result = "";
    var content = "";
    content = "<table>";

    for (var i = 0, il = idResults.length; i < il; i++) {
      var idResult = idResults[i];
      console.log(idResult);
      if (idResult.layerId === 1) {
        if (!kccdstResults.displayFieldName) {
          kccdstResults.displayFieldName = idResult.displayFieldName
        };
        kccdstResults.features.push(idResult.feature);
      } else if (idResult.layerId === 2) {
        if (!congdstResults.displayFieldName) {
          congdstResults.displayFieldName = idResult.displayFieldName
        };
        congdstResults.features.push(idResult.feature);
      } else if (idResult.layerId === 3) {
        if (!legdstResults.displayFieldName) {
          legdstResults.displayFieldName = idResult.displayFieldName
        };
        legdstResults.features.push(idResult.feature);
      } else if (idResult.layerId === 0) {
        if (!votdstResults.displayFieldName) {
          votdstResults.displayFieldName = idResult.displayFieldName
        };
        votdstResults.features.push(idResult.feature);
      } else if (idResult.layerId === 4) {
        if (!seadstResults.displayFieldName) {
          seadstResults.displayFieldName = idResult.displayFieldName;
        };
        seadstResults.features.push(idResult.feature);
      }
    }

    for (var k = 0, kl = kccdstResults.features.length; k < kl; k++) {
      content += "<tr><td>King County Council District:</td><td>" + kccdstResults.features[k].attributes['kccdst'] + "</td></tr>" //['kccdst']
    }
    for (var k = 0, kl = congdstResults.features.length; k < kl; k++) {
      content += "<tr><td>Congressional District:</td><td>" + congdstResults.features[k].attributes['CONGDST'] + "</td></tr>" //['CONGDST']
    }
    for (var k = 0, kl = legdstResults.features.length; k < kl; k++) {
      content += "<tr><td>Legislative District:</td><td>" + legdstResults.features[k].attributes['LEGDST'] + "</td></tr>" //['LEGDST']
    }
    for (var k = 0, kl = votdstResults.features.length; k < kl; k++) {
      content += "<tr><td>Precinct:</td><td>" + votdstResults.features[k].attributes['NAME'] + "</td></tr>"
    }
    for (var k = 0, kl = seadstResults.features.length; k < kl; k++) {
      var s = seadstResults.features[k].attributes['NAME'];
      s = s.substr(s.length - 1);
      content += "<tr><td>Seattle City Council District:</td><td>" + s + "</td></tr>"
      console.log(seadstResults.features[k]);
    }

    content += "</table>";

    map.infoWindow.setContent(content);
    map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
    dojo.style(dojo.byId("loadingDiv"), "display", "none");
  }


  function showFeatureClick(feature) {
    dojo.style(dojo.byId("loadingDiv"), "display", "block");
    map.graphics.clear();
    feature.setSymbol(dstSymbol);
    map.graphics.add(feature);
    //zoom to selected
    extent = getGraphicsExtent(map.graphics.graphics);
    map.setExtent(extent);
    dojo.style(dojo.byId("loadingDiv"), "display", "none");
  }




  //coming from address search
  function doIdentify(evt, address, mapExtent) {
    document.getElementById('council2').innerHTML = "";
    document.getElementById('congressional2').innerHTML = "";
    document.getElementById('legislative2').innerHTML = "";
    document.getElementById('voting2').innerHTML = "";
    document.getElementById('seattle2').innerHTML = "";

    console.log("doIdentify, " + evt + ", " + address);
    console.log("doIdentify mapExtent = " + mapExtent.xmin + ", " + mapExtent.ymin + ", " + mapExtent.xmax + ", " + mapExtent.ymax);
    if (!address) { //address is null
      address = "";
    }
    dojo.style(dojo.byId("loadingDiv"), "display", "block");

    //map.infoWindow.hide();
    selectedFeatureQuery = "";
    //    identifyParams.layerIds = [1,2,3,16,17,18];
    identifyParams.geometry = evt; //evt.mapPoint;
    identifyParams.mapExtent = map.extent; //3/14/11
    //identifyParams.mapExtent = mapExtent;
    identifyTask.execute(identifyParams, function(idResults) {
      addToMap(address, idResults, evt.screenPoint);
    });
    dojo.stopEvent(evt);
    console.log("doIdentify end");
  }

  function addToMap(address, idResults, screenPoint) {
    console.log("addToMap, address = " + address);
    layerResults = {
      displayFieldName: null,
      features: []
    };
    var kccdst = "";
    var congdst = "";
    var legdst = "";
    var votedst = "";
    var seadst = "";
    var infoWindowOK = false;
    console.log("idResults = " + idResults);
    //$('#addrfound1').text("Address (street & zip): " + address);
    //document.getElementById('addrfound1').innerHTML = "Address (street & zip): " + address;

    if (idResults.length > 0) {
      infoWindowOK = true;
      for (var r = 0, rl = idResults.length; r < rl; r++) {
        var idResult = idResults[r];
        console.log("layer id = " + idResult.layerId);
        layerResults.features.push(idResult.feature);
      }
      console.log("layerResults.features.length = " + layerResults.features.length);
      console.log("layerResults.features = " + layerResults.features);
      console.log(layerResults);

      for (i = 0; i < layerResults.features.length; i++) {
        var graphic = layerResults.features[i];
        console.log(layerResults.features[i]);
        if (layerResults.features[i].attributes.kccdst != undefined) {
          kccdst = layerResults.features[i].attributes.kccdst;
          //$('#council2').text("King County Council District: " + kccdst);
          document.getElementById('council2').innerHTML = "King County Council District: " + kccdst;
          graphic.setSymbol(kccdstSymbol);
          map.graphics.add(graphic);
        }
        if (layerResults.features[i].attributes.CONGDST != undefined) {
          congdst = layerResults.features[i].attributes.CONGDST;
          //$('#congressional2').text("Congressional District: " + congdst);
          document.getElementById('congressional2').innerHTML = "Congressional District: " + congdst;
          graphic.setSymbol(congdstSymbol);
          map.graphics.add(graphic);
        }
        if (layerResults.features[i].attributes.LEGDST != undefined) {
          legdst = layerResults.features[i].attributes.LEGDST;
          //$('#legislative2').text("Legislative District: " + legdst);
          document.getElementById('legislative2').innerHTML = "Legislative District: " + legdst;
          graphic.setSymbol(legdstSymbol);
          map.graphics.add(graphic);
        }
        if (layerResults.features[i].attributes.votdst != undefined) {
          votedst = layerResults.features[i].attributes.NAME;
          //$('#voting').text("Precinct: " + votedst);
          document.getElementById('voting2').innerHTML = "Precinct: " + votedst;
          graphic.setSymbol(votedstSymbol);
          map.graphics.add(graphic);
        }
        if (layerResults.features[i].attributes.MS1DST != undefined) {
          seadst = layerResults.features[i].attributes.NAME;
          seadst = seadst.substr(seadst.length - 1);
          console.log(seadst);
          document.getElementById('seattle2').innerHTML = "Seattle City Council District: " + seadst;
          graphic.setSymbol(seadstSymbol);
          map.graphics.add(graphic);
        }

        dojo.style(dojo.byId("loadingDiv"), "display", "none");
      }
    }
    console.log("addToMap end");

  }
});
