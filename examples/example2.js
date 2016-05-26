var miss          = require('mississippi');
var split         = require('split')
var isConsenting  = require('./index.js');
var fs            = require('fs');

// fs.createReadStream('./fixtures/1.txt')
fs.createReadStream('./fixtures/2.txt')
.pipe(split())
.pipe(fromJSon())
.pipe(isConsenting.filter())
.pipe(isConsenting.watcher([27]))
.on('enter', function (c){
  console.log('%s enter', c.pid)
})
.on('leave', function (c){
  console.log('%s left', c.pid)
})
.on('end', function (){
  console.log('end')
})


function fromJSon () {
  var transform = function (chunk, enc, cb) {
    cb(null, chunk && JSON.parse(chunk))
  }
  return miss.through.obj(transform)
}
