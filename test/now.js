require('should')

var miss          = require('mississippi');
var split         = require('split')
var isConsenting  = require('../index.js');
var fs            = require('fs');

describe('is-consenting now', function () {
  it('should find the process', function (done) {
    isConsenting.now(/^node$/, function (err, isRunning) {
      (!err).should.eql(true);
      (!!isRunning).should.eql(true);
      done();
    })
  })
  it('should not find the process', function (done) {
    isConsenting.now(/^noded$/, function (err, isRunning) {
      (!err).should.eql(false);
      (!!isRunning).should.eql(false);
      done();
    })
  })
})
