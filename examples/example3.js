var isConsenting  = require('./index.js');

var s = isConsenting.esPsList(/^node/)
.on('enter', function (p) {
  console.log('a node process appeared')
  console.log("%j", p);
}).on('leave', function (p) {
  console.log('a node process left')
  console.log("%j", p);
})

var c = require('child_process').spawn('node')
c.on('close', function () {
  s.once('leave', s.close.bind(s))
})
setTimeout(function () {
  c.kill();
}, 500)
