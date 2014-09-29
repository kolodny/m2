var fs = require('fs');
var glob = require('glob');
var Promise = require('bluebird');
var _ = require('lodash');

var globAsync = Promise.promisify(glob);
fs = Promise.promisifyAll(fs);

function m2(options) {

  options = _.extend(options || {}, {
    recursive: false
  });

  var globStr = 'test/';
  if (options.recursive) glob += '**/';
  globStr += '*.js';

  Promise.resolve().then(function() {
    return globAsync(globStr)
  })
  .then(function(files) {
    return Promise.all(files.map(function(file) {
      return new Promise(function(resolve) {
        fs.readFileAsync(file).then(function(contents) {
          resolve({
            name: file,
            contents: contents
          });
        });
      });
    }));
  })
  .then(function(files) {
    return Promise.all(files.map(function(file) {
      return new Promise(function(resolve) {
        testFile(file, resolve)
      });
    }));
  })

}

function testFile(file, done) {
  var suites = [];
  var tests = [];
  var thisSuite;
  function describe(describeText, describeCb) {
    suites.push({describeText: describeText, describeCb: describeCb});
    thisSuite = suites[suites.length - 1];
    describeCb();
  }
  function it(itText, itCb) {
    tests.push({
      parent: thisSuite,
      itText: itText,
      itCb: itCb
    });
    if (!thisSuite.its) thisSuite.its = [];
    thisSuite.its.push(tests[tests.length - 1]);
  }
  function runTest() {
    while (suites.length) {
      var suite = suites.pop();
      if (suite.its)
      while (suite.its.length) {
        var test = suite.its.pop();
        try {
          test.itCb();
        } catch(e) {
          console.log('failed');
          throw e;
        }
      }
      console.log('passed');
    }
  }
  var testSandbox = new Function('return function(describe, it) {' +
   file.contents +
   '}')()(describe, it);
   runTest();
}

m2();
