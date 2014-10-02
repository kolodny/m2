var Promise = require('bluebird');

module.exports = testSuite;

function testSuite(suites, options) {
  var passed = true;

  return new Promise(function(resolve) {
    var passed = true;
    var tests = [];
    var testsPromises = [];

    suites.forEach(function(suite) {
      runSetup(suite, 'before');
      suite.tests.forEach(function(test) {
        tests.push(test);
        runSetup(suite, 'beforeEach');
        var promise = runTest(test, options)
          .catch(function(e) {
            passed = false;
          })
          ;
        testsPromises.push(promise);
      });
      return Promise.all(testsPromises).then(function() {
        return passed ? 0 : 1; // exit code
      });
    });

  });
}

function runSetup(suite, method) {
  if (suite.parentSuite) {
    runSetup(suite.parentSuite, method);
  }
  suite[method].forEach(function(fn) {
    fn();
  });
}

function runTest(test, options) {
  return new Promise(function(resolve, reject) {
    var timedOut;
    try {
      test.fn(function() {
        clearTimeout(timedOut);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
    if (test.fn.length) {
      timedOut = setTimeout(function() {
        reject(new Error('test timed out'));
      }, options.timeout);
    } else {
      resolve();
    }
  });
}

