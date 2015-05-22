//'use strict';
Amd = function () {

};
Amd.prototype.load = function (modulePath, moduleName) {
  'use strict';
  var self = this;
  require(modulePath, function (module) {
    self[moduleName] = module;
  });
};
Amd.prototype.loadModules = function (modules) {
  'use strict';
  var self = this;
  modules.forEach(function (module) {
    self.load(module.path, module.module);
  });
  self.initialize();
};
Amd.prototype._loaded = new ReactiveVar(false);
Amd.prototype.loaded = function () {
  'use strict';
  var self = this;
  return self._loaded.get();
};
Amd.prototype.initialize = function () {
  'use strict';
  var self = this;
  self._loaded.set(true);
};
