#!/usr/bin/env node

/**
 * Demo script for [hiplog]
 * ========================
 *
 * Usage:
 *
 * ```sh
 * LOG=debug ./demo.js
 * LOG=debug LOG_TIME=true ./demo.js
 * ```
 *
 * [hiplog]: https://www.npmjs.com/package/hiplog
 */

const { fromEnvironmentVariables } = require('.'); // eslint-disable-line import/no-unresolved

const log = fromEnvironmentVariables();

process.stdout.write('\n');

// Log levels
log.debug('messages to debug an application');
log.info('a purely informational message');
log.notice('a normal but significant condition');
log.warning('warning condition');
log.error('error condition');
log.critical('the system is in critical condition');
log.alert('action must be taken immediately');
log.emergency('system is unusable');
process.stdout.write('\n');

// Objects

log.info('a small object:', { int: 123, bool: true, str: 'Hello' });
process.stdout.write('\n');

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

// Error
try {
  throw new Error('Error example');
} catch (e) {
  log.error(e);
}
