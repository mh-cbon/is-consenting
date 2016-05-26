var isConsenting  = require('./index.js');

var s = isConsenting.esPsList(/^node/, true)
.on('enter', function (p) {
  console.log('a node process appeared')
  console.log("%j", p);
})
.on('leave', function (p) {
  console.log('a node process left')
  console.log("%j", p);
})
.on('end', function (p) {
  console.log('end')
})
.resume()

var c = require('child_process')
.spawn('node')
.on('close', function () {
  s.once('leave', s.close.bind(s))
})
setTimeout(function () {
  c.kill();
}, 500)
