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
      return testFile(file, options)
    }));
  })

}

function testFile(file, options) {
  return new Promise(function(resolve) {
    var suites = [];
    var tests = [];
    var currentSuite = createSuite('root', function() {});
    console.log(currentSuite)
    function createSuite(describeText, describeCb) {
      return {
        describeText: describeText,
        describeCb: describeCb,
        parentSuite: currentSuite,
        beforeEach: [],
        before: [],
        afterEach: [],
        after: []
      };
    }
    function describe(describeText, describeCb) {
      var suite = createSuite(describeText, describeCb);
      suites.push(suite);
      currentSuite = suite;
      describeCb();
      currentSuite = null;
    }
    function it(itText, itCb) {
      var test = {
        parent: currentSuite,
        itText: itText,
        itCb: itCb
      };
      tests.push(test);
      if (!currentSuite.its) currentSuite.its = [];
      currentSuite.its.push(test);
    }
    function runSetup(name, suite) {
      if (suite.parentSuite) runSetup(name, suite.parentSuite);
      suite[name].forEach(function(fn) { fn(); });
    }
    function beforeEach(fn) { currentSuite.beforeEach.push(fn); }
    function before(fn) { currentSuite.before.push(fn); }
    function afterEach(fn) { currentSuite.afterEach.push(fn); }
    function after(fn) { currentSuite.after.push(fn); }
    function runTest() {
      var waitingFor = 0;
      var done = function() {
        waitingFor--;
        if (!waitingFor) {
          passed();
          resolve();
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
            runSetup('beforeEach', suite)
            test.itCb(done);
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
    var testSandbox = (new Function(
      'return function(describe, it, beforeEach, before, afterEach, after) {' +
        file.contents +
      '}'))()(describe, it, beforeEach, before, afterEach, after);
    runTest();
  });
}

m2();
