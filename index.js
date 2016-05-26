var miss    = require('mississippi');
var psList  = require('ps-list');

var now = function (filter, done) {
  if (!done && typeof(filter)==='function') {
    done = filter;
    filter = /^consent\.exe$/
  }
  psList().then(data => {
    var found = false;
    data.forEach(function (d) {
      if (!found && d.name.match(filter)) found = d;
    });
    done(null, found);
  }).catch(done);
}

var psStream = require('./ps-stream.js')
var streamFilter = function (what) {
  what = what || /^consent\.exe$/;
  var filter = function (chunk, enc, cb) {
    if (chunk && chunk.end) this.push(chunk);
    else if (chunk && chunk.name.match(what)) this.push(chunk)
    cb();
  }
  return miss.through.obj(filter);
}
var streamWatcher = function (ignored) {
  ignored = ignored || []
  var known = {};
  var transform = function (chunk, enc, cb) {
    var that = this;
    if (chunk && chunk.end) {
      Object.keys(known).forEach(function(pid){
        var c = known[pid];
        if (!c.found) {
          that.emit('leave', c);
          delete known[pid];
        } else c.found=false;
      })
    } else if(chunk && known[chunk.pid]) {
      known[chunk.pid].found=true;
    } else if (chunk && ignored.indexOf(chunk.pid)===-1){
      known[chunk.pid] = chunk;
      known[chunk.pid].found=true;
      that.emit('enter', chunk);
    }
    cb();
  }
  return miss.through.obj(transform);
}
var esPsList = function (filter, ignoreCurrents) {
  if (!ignoreCurrents) {
    var ps = psStream();
    var th = ps.pipe(streamFilter(filter)).pipe(streamWatcher());
    th.close = function () {
      ps && ps.close();
    }
    return th;
  }
  var tStream = miss.through.obj();
  var ps;
  var stopped = false;
  psList().then(data => {
    if(stopped) return;
    ps = psStream();
    filter = filter || /^consent\.exe$/;
    data = data.filter((d) => {return d.name.match(filter)}).map((d) => {return d.pid})
    var th = ps.pipe(streamFilter(filter)).pipe(streamWatcher(data));
    th.on('enter', (c) => {
      tStream.emit('enter', c)
    }).on('leave', (c) => {
      tStream.emit('leave', c)
    })
  }).then(function () {
    tStream.resume();
  }).catch(function (err) {
    tStream.emit('error', err);
  });
  tStream.close = function () {
    stopped = true;
    ps && ps.close();
    !ps && tStream.end();
  }
  return tStream;
}

module.exports = {
  now:      now,
  filter:   streamFilter,
  watcher:  streamWatcher,
  psStream: psStream,
  esPsList: esPsList,
}
