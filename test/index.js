describe('a test', function() {
  it('is a test', function(done) {
    console.log(123);
    setTimeout(function() {
      console.log(234);
      //throw new Error(42);
      done();
    }, 1500);

  })
})

describe('a test2', function() {
  it('is a test2', function(done) {
    console.log(123);
    setTimeout(done, 1500);

  })
})
