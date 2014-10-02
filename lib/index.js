var Promise = require('bluebird');
var fs = require('fs');
var glob = require('glob');
var _ = require('lodash');
var processFile = require('./process-file.js');

var globAsync = Promise.promisify(glob);

module.exports = m2;

function m2(options) {
  options = _.extend(options || {}, {
    recursive: false,
    timeout: 2000,
  });

  var globStr = 'test/';
  if (options.recursive) {
    glob += '**/';
  }
  globStr += '*.js';

  new Promise(function(resolve) {
    globAsync(globStr)
      .then(function(filenames) {
        return filenames.map(function(filename) {
          return processFile(filename, options);
        });
      });
  });
}

