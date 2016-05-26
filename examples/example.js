var psStream = require('./ps-stream.js')
var miss = require('mississippi');

var stringify = function () {
  return miss.through.obj(function (obj, enc, cb) {
    if (!obj.end) cb(null, JSON.stringify(obj) + '\n')
    else setTimeout(function () {
      cb(null, "\n------------------------------\n\n")
    }, 10)
  });
}

psStream()
.pipe(stringify())
.pipe(process.stdout);
