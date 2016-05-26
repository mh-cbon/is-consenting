require('should')

var miss          = require('mississippi');
var split         = require('split')
var isConsenting  = require('../index.js');
var fs            = require('fs');

describe('is-consenting es-stream', function () {
  it('should not emit enter/leave event when the process is not found', function (done) {
    var events = '';
    fs.createReadStream('./fixtures/1.txt')
    .pipe(split())
    .pipe(fromJSon())
    .pipe(isConsenting.filter())
    .pipe(isConsenting.watcher())
    .on('enter', function (c){
      events += 'enter'
    })
    .on('leave', function (c){
      events += 'leave'
    })
    .on('end', function (){
      events.should.eql('')
      done();
    }).resume()
  })
  it('should emit enter/leave event when the process is found', function (done) {
    var events = '';
    fs.createReadStream('./fixtures/2.txt')
    .pipe(split())
    .pipe(fromJSon())
    .pipe(isConsenting.filter())
    .pipe(isConsenting.watcher())
    .on('enter', function (c){
      events += 'enter'
    })
    .on('leave', function (c){
      events += 'leave'
    })
    .on('end', function (){
      events.should.eql('enterleaveenterleave')
      done();
    }).resume()
  })
  it('should not emit enter/leave event when it meet an ignored PID', function (done) {
    var events = '';
    fs.createReadStream('./fixtures/2.txt')
    .pipe(split())
    .pipe(fromJSon())
    .pipe(isConsenting.filter())
    .pipe(isConsenting.watcher([27, 28]))
    .on('enter', function (c){
      events += 'enter'
    })
    .on('leave', function (c){
      events += 'leave'
    })
    .on('end', function (){
      events.should.eql('')
      done();
    }).resume()
  })
  it('should find this node process', function (done) {
    var events = '';
    var s = isConsenting.esPsList(/^node/).on('enter', function () {
      events += 'enter'
      s.close();
    }).on('end', function () {
      events.should.eql('enter')
      done();
    }).resume()
  })
  it('should close properly', function (done) {
    isConsenting.esPsList().on('end', done).resume().close();
  })
  it('should close properly when ignoreCurrents is true', function (done) {
    isConsenting.esPsList(null, true).on('end', done).resume().close();
  })
})

function fromJSon () {
  var transform = function (chunk, enc, cb) {
    cb(null, chunk && JSON.parse(chunk))
  }
  return miss.through.obj(transform)
}
