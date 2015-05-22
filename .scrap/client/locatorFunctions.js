Template.hello.onRendered(function() {
  var iScore = 60;

  //See if address or pin is entered. Go to geocode service is address is entered. Go to query for PIN.
  function locateCheck() {
    dojo.style(dojo.byId("loadingDiv"), "display", "block");
    map.graphics.clear();
    var sCheck = dojo.byId("inAddress").value;
    var re10digit = /^[0-9]{10}$/;
    //remove white space before and after PIN
    var sCheckPIN = sCheck.replace(/^\s+|\s+$/g, '');
    //    console.log("sCheckPIN = '" + sCheckPIN + "'");

    if (document.getElementById('btnClear') != null) {
      document.getElementById('btnClear').style.visibility = "visible";
    }

    if (sCheckPIN.search(re10digit) == -1) {
      console.log("ADDRESS!");
      locate();
    } else {
      console.log("PIN!");
      map.graphics.clear();
      //        doQuery(sCheck);
    }
  }

  function changeScore() {
    iScore = dojo.byId("txtScore").value;
    locateCheck();
  }

  function locate() {
    console.log("locate start");
    map.graphics.clear();
    resultGraphicLayer.clear();
    map.infoWindow.hide();

    document.getElementById('council2').innerHTML = "";
    document.getElementById('congressional2').innerHTML = "";
    document.getElementById('legislative2').innerHTML = "";
    document.getElementById('voting2').innerHTML = "";
    document.getElementById('seattle2').innerHTML = "";

    var add = dojo.byId("inAddress").value.split(",");
    //       var address = {
    //         Street : add[0]
    //       };
    var address = {
      //Address : add[0],
      Street: add[0],
      City: add[1],
      State: add[2],
      Zip: add[3]
    };
    locator.outSpatialReference = map.spatialReference;
    //    locator.addressToLocations(address);
    locator.addressToLocations(address, ["Loc_name"]);
    //    if(document.getElementById('btnClear')!= null){
    //        document.getElementById('btnClear').style.visibility="visible";
    //    }
    console.log("locate end");
  }


  function onRowClickHandler(evt) {
    console.log("onRowClickHandler start")
    var clickedAddress = grid.getItem(evt.rowIndex).x;
    var selectedAddress;
    for (var i = 0, il = map.graphics.graphics.length; i < il; i++) {
      var currentGraphic = map.graphics.graphics[i];
      if ((currentGraphic.attributes) && currentGraphic.attributes.x == clickedAddress) {
        selectedAddress = currentGraphic;
        break;
      }
    }
    var addressExtent = selectedAddress.geometry.getExtent();
    map.setExtent(addressExtent);
    console.log("onRowClickHandler end")
  }


  function connectresultsGrid() {
    console.log("connectresultsGrid start")
      // attache event handlers to the grid rows
    selectedGridClick_handler = dojo.connect(resultsGrid, "onRowClick", function(evt) {
      var rowId = evt.rowIndex;
      console.log("click: " + rowId);
      map.centerAndZoom(resultGraphicLayer.graphics[rowId].geometry, 10);
    });
    //
    selectedGridMouseOver_handler = dojo.connect(resultsGrid, "onMouseOverRow", function(evt) {
      try {
        if (evt.rowIndex != -1) {
          var rowId = evt.rowIndex;
          console.log("mouseOver: " + rowId);
          resultGraphicLayer.graphics[rowId].setSymbol(highlightSymbol);
        }
      } catch (err) {
        //Handle errors here
        console.log(err);
      }
    });
    //
    selectedGridMouseOut_handler = dojo.connect(resultsGrid, "onMouseOutRow", function(evt) {
      try {
        if (evt.rowIndex != -1) {
          var rowId = evt.rowIndex;
          console.log("mouseOut: " + rowId);
          resultGraphicLayer.graphics[rowId].setSymbol(resultSymbol);
        }
      } catch (err) {
        //Handle errors here
        console.log(err);
      }
    });
    console.log("connectresultsGrid end")
  }




  function addressSelect(address, x, y) {
    console.log("ADDRESS = " + address);
    console.log("ADDRESSSELECT = " + address + ", x=" + x + ", y=" + y);
    //    returnAddress(address);
    //    $('#addressPick').val("Selected Address: " + address);
    var pt = new esri.geometry.Point([x, y], map.spatialReference);
    console.log("pt count = " + pt.length);
    //doQuery(address);
    doIdentify(pt, address, initExtent);
    //    var thisExtent = new esri.geometry.Extent(x, y, x, y, new esri.SpatialReference({wkid:2285}));
    //    doIdentify(pt,address,thisExtent);
  }



  function submitenter(myfield, e) {
    var keycode;
    if (window.event) keycode = window.event.keyCode;
    else if (e) keycode = e.which;
    else return true;

    if (keycode == 13) {
      //      locate(exact);
      locate();
      dojo.byId('btnClear').style.visibility = "visible";
      return false;
    } else return true;
  }

  function clickclear(thisfield, defaulttext) {
    if (thisfield.value == defaulttext) {
      thisfield.value = "";
    }
  }

  function clickrecall(thisfield, defaulttext) {
    if (thisfield.value == "") {
      thisfield.value = defaulttext;
    }
  }
});
