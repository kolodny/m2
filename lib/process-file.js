var Promise = require('bluebird');
var fs = require('fs');
var buildSuites = require('./build-suites.js');
var testSuite = require('./test-suite.js')

var readFileAsync = Promise.promisify(fs.readFile);

module.exports = processFile;

function processFile(filename, options) {
  return new Promise(function(resolve) {
    readFileAsync(filename)
      .then(function(contents) {
        return buildSuites({name: filename, contents: contents});
      })
      .then(function(suites) {
        return testSuite(suites, options); // returns exit code
      })
      .then(resolve)
      ;
  });
}
