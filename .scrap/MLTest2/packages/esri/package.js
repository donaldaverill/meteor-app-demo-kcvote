Package.describe({
  name: 'esri',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function (api) {
  'use strict';
  api.versionsFrom('1.1.0.2');
  api.use('jquery', ['client']);
  api.use('underscore', ['client']);
  api.use('reactive-var', ['client']);
  api.addFiles('esri.js', ['client']);
  api.export('Esri', ['client']);
});

Package.onTest(function (api) {
  'use strict';
  api.use('tinytest');
  api.use('esri');
  api.addFiles('esri-tests.js');
});
