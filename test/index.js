beforeEach(function() {
  console.log('wont work')
})
describe('a test', function() {
  beforeEach(function() {
    console.log('inside beforeEach')
  })
  it('is a test', function(done) {
    console.log(9);
    setTimeout(function() {
      console.log(234);
      //throw new Error(42);
      done();
    }, 1500);

  });

  it('is also test', function(done) {
    console.log(8);
    setTimeout(function() {
      console.log(234);
      //throw new Error(42);
      done();
    }, 1500);

  })
})

describe('a test2', function() {
  it('is a test2', function(done) {
    console.log(1234);
    setTimeout(done, 1500);

  })
})
