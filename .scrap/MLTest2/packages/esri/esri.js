Esri = new esri();

function esri() {
  'use strict';
  /* jshint -W040 */
  var self = this;
  /*,
      /*modules = {},
      notFoundHooks = [],
      alreadyDefinedHooks = [],
      listOfModules = [],
      loadingStack = [];*/

  var _loaded = new ReactiveVar(false);
  var _initialized = new ReactiveVar(false);
  self.maps = {};
  self._callbacks = {};

  function _initialize() {
    _initialized.set(true);
  }
  var _loading = new ReactiveVar(false);

  function _loadModule(moduleName) {
    check(moduleName, String);
    _loading.set(true);
    var moduleVariableName =
      moduleName.substring(moduleName.lastIndexOf('/') + 1);
    console.log('requiring : ', moduleName, moduleVariableName);
    require([moduleName], function (module) {
      self[moduleVariableName] = module;
      console.log('required : ', moduleVariableName);
      _loading.set(false);
    });
  }
  self.initialize = function (options) {
    if (!self.initialized()) {
      $.getScript('http://js.arcgis.com/3.13/',
        function (
          data,
          textStatus,
          jqxhr) {
          console.log(data); // Data returned
          console.log(textStatus); // Success
          console.log(jqxhr.status); // 200
          console.log('Esri Script Load was performed.');
          _initialize();
        });
    }
  };
  self.initialized = function () {
    return _initialized.get();
  };
  self.loaded = function () {
    return _loaded.get();
  };
  self.loading = function () {
    return _loading.get();
  };
  self.loadModules = function (modules) {
    check(modules, [String]);
    modules.forEach(function (module) {
      _loadModule(module);
    });
    require([
      'dojo/domReady!'
    ], function () {
      _loaded.set(true);
    });
  };
  self.require = function () {
    return require;
  };
}
