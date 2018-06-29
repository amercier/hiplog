<h1 align="center">
  <img
    alt="hiplog"
    src="./media/img/header.svg"
    width="300"
  />
</h1>

> Fancy lightweight logging utility for Node.js

[![Latest Stable Version](https://img.shields.io/npm/v/hiplog.svg)](https://www.npmjs.com/package/hiplog)
[![Build Status](https://travis-ci.org/amercier/hiplog.svg?branch=master)](https://travis-ci.org/amercier/hiplog)
[![NPM Downloads](https://img.shields.io/npm/dm/hiplog.svg)](https://www.npmjs.com/package/hiplog)

[![dependencies Status](https://david-dm.org/amercier/hiplog/status.svg)](https://david-dm.org/amercier/hiplog)
[![Test Coverage](https://img.shields.io/codecov/c/github/amercier/hiplog/master.svg)](https://codecov.io/github/amercier/hiplog?branch=master)
[![API Documentation](https://doc.esdoc.org/github.com/amercier/hiplog/badge.svg)](https://doc.esdoc.org/github.com/amercier/hiplog/)

Installation
------------

Prerequisites: [Node.js](https://nodejs.org/) 6+, **npm** 3+.

    npm install --save hiplog

Usage
-----

```js
const { Log } = require('hiplog');
const log = new Log({ level: 'debug' });
```

```js
log.debug('messages to debug an application');
log.info('a purely informational message');
log.notice('a normal but significant condition');
log.warning('warning condition');
log.error('error condition');
log.critical('the system is in critical condition');
log.alert('action must be taken immediately');
log.emergency('system is unusable');
```

![Hiplog levels output][doc-img-levels]

### Objects

Objects are automatically stringified using [Purdy]. Small objects (< 200
characters) are inlined.

```js
log.info('a small object:', { int: 123, bool: true, str: 'Hello' });
```

![Hiplog small objects output][doc-img-object-small]

```js
const circular = {};
circular.inner = circular;

log.info('a bigger object', {
  null: null,
  undefined,
  integer: 123,
  boolean: true,
  string: 'Hello',
  funtion: function myFunction() {},
  circular,
  array: ['one', 'two', 'three', 'four'],
});
```

![Hiplog big objects output][doc-img-object-big]

### Errors

Errors are displayed using

```js
try {
  throw new Error('Error example');
} catch (e) {
  log.error(e);
}
``````

![Hiplog errors output][doc-img-error]

Contributing
------------

Please refer to the [guidelines for contributing](./CONTRIBUTING.md).

[![devDependencies Status](https://david-dm.org/amercier/hiplog/dev-status.svg)](https://david-dm.org/amercier/hiplog?type=dev)

License
-------

[![License](https://img.shields.io/npm/l/hiplog.svg)](LICENSE.md)

---
<sup>_Created with [npm-package-skeleton](https://github.com/amercier/npm-package-skeleton)._</sup>

[doc-img-levels]: ./media/img/doc/levels.png
[doc-img-object-small]: ./media/img/doc/object-small.png
[doc-img-object-big]: ./media/img/doc/object-big.png
[doc-img-error]: ./media/img/doc/error.png
[Purdy]: https://www.npmjs.com/package/purdy
