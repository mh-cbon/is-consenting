var miss    = require('mississippi');
var psList  = require('ps-list');

var psStream = function () {

  var stopped = false;
  var currentList = [];
  var pending;

  var updateList = function (pending) {
    if (stopped) return pending();
    psList().then(data => {
      currentList = currentList.concat(data).concat([{
        end: true
      }])
      pending()
    }).catch(pending);
  }

  var read = function (size, next) {
    var that = this;
    var pushSome = function () {
      currentList.splice(0, size-1).forEach(function (e) {
        that.push(e);
      });
    }
    if (currentList.length<size) {
      updateList(function () {
        pushSome();
        next(null, currentList.shift());
      })
    } else {
      pushSome();
      next(null, currentList.shift());
    }
  }
  var stream = miss.from.obj(read);
  stream.close = function () {
    stopped = true;
    stream.push(null);
  }
  return stream;
}

module.exports = psStream;
