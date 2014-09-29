var fs = require('fs');
var glob = require('glob');
var Promise = require('bluebird');
var _ = require('lodash');

var globAsync = Promise.promisify(glob);
fs = Promise.promisifyAll(fs);

function m2(options) {

  options = _.extend(options || {}, {
    recursive: false,
    timeout: 2000
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
        testFile(file, resolve, options)
      });
    }));
  })

}

function testFile(file, done, options) {
  var suites = [];
  var tests = [];
  var thisSuite;
  function describe(describeText, describeCb) {
    var suite = {
      describeText: describeText,
      describeCb: describeCb,
      parentSuite: suite
    };
    suites.push(suite);
    thisSuite = suite;
    describeCb();
    thisSuite = null;
  }
  function it(itText, itCb) {
    var test = {
      parent: thisSuite,
      itText: itText,
      itCb: itCb
    };
    tests.push(test);
    if (!thisSuite.its) thisSuite.its = [];
    thisSuite.its.push(test);
  }
  function runTest(done) {
    var waitingFor = 0;
    var doneWrapper = function() {
      waitingFor--;
      if (!waitingFor) {
        passed();
        done();
      }
    };
    var passed = function() {
      console.log('passed');
      clearTimeout(failTimer);
    };
    var failed = function(reason) {
      console.log('failed from ' + reason);
      clearTimeout(failTimer);
    };
    var failTimer;

    while (suites.length) {
      var suite = suites.pop();
      if (suite.its)
      while (suite.its.length) {
        var test = suite.its.pop();
        try {
          test.itCb(doneWrapper);
        } catch(e) {
          console.log('failed');
          throw e;
        }
        if (test.itCb.length) {
          waitingFor++;
          if (!failTimer) {
            failTimer = setTimeout(failed.bind(null, 'timeout'), options.timeout);
          }
        }
      }
    }
  }
  var testSandbox = (new Function('return function(describe, it) {' +
   file.contents +
   '}'))()(describe, it);
   runTest(done);
}

m2();
