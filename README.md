# is-consenting

Tells if `consent.exe` (uac) is running.

# Install

```
  npm i @mh-cbon/is-consenting --save
```

# Usage

### As a simple callback

```js
var isConsenting  = require('@mh-cbon/is-consenting');

isConsenting.now(function (err, p) {
  if (err) throw err;
  console.log("UAC is running now: %s", !!p);
  p && console.log("%j", p);
})
```

### As an event stream

Every time a `node` process enters / leaves, an event is emitted

```js
var isConsenting  = require('@mh-cbon/is-consenting');

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

```

Pass `true` as a second argument, to ignore existing process and catch only new ones,

```js
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
```

### Close

As an event-stream, it is an infinite stream, thus, you are required to call
the `close` method to free any pending operations.

`close` method will `end` the stream.
