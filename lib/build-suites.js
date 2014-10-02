var currentSuite;
var suites = [];

module.exports = buildSuites;

function buildSuites(file) {
  var api = {
    beforeEach: appender('beforeEach'),
    afterEach: appender('afterEach'),
    before: appender('before'),
    after: appender('after'),
    describe: describe,
    it: it,
  };
  var argList = Object.keys(api);
  var argValues = argList.map(function(key) {
    return api[key];
  });
  var context = {};

  describe('root', function() {});

  (new Function(
    'return function(' + argList + '){' + file.contents + '}'
  ))().apply(context, argValues);
  return suites;
}

function describe(name, fn) {
  currentSuite = {
    name: name,
    fn: fn,
    beforeEach: [],
    afterEach: [],
    before: [],
    after: [],
    tests: [],
    childSuites: [],
    parentSuite: currentSuite,
  };
  if (currentSuite.parentSuite) {
    currentSuite.parentSuite.childSuites.push(currentSuite);
  }
  suites.push(currentSuite);
  fn();
}
function it(name, fn) {
  var test = {
    name: name,
    fn: fn,
    parentSuite: currentSuite,
  }
  currentSuite.tests.push(test);
}

function appender(name) {
  return function(fn) {
    currentSuite[name].push(fn);
  }
}
