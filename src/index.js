import {
  red, yellow, magenta, blue, grey,
} from 'chalk';
import dateFormat from 'dateformat';
import defaults from 'lodash.defaults';
import { separateMessageFromStack, formatStackTrace } from 'jest-message-util';
import { dirname } from 'path';
import { stringify } from 'purdy';
import stripAnsi from 'strip-ansi';

/**
 * Function that returns a Stream.
 *
 * @typedef {Function} Log~streamFn
 * @param {number} level - Level number.
 * @returns {Stream} A Stream
 */

/**
 * Options for `Log`.
 *
 * @typedef {Object} Log~options
 * @property {string[]} levels - Log levels.
 * @property {function[]} colors - Color function for each level.
 * @property {boolean[]} inverse - Whether to inverse color for each level.
 * @property {string[]} labels - Label of each level.
 * @property {string} separator - Separator between time and label, and between header and body
 * @property {Stream|Log~streamFn} stream - Stream or function that returns a Stream.
 * @property {boolean} displayTime - Whether to display time.
 * @property {string} displayTimeFormat - Format to display time in. See [dateformat].
 * @property {string} level - All log calls below this level will be ignored.
 *
 * [dateformat]: https://www.npmjs.com/package/dateformat
 */

/**
 * Add characters at the begenning of every line of a multi-line string.
 *
 * @param {string} string - Input string.
 * @param {number} length - Number of characters to insert at every line.
 * @param {string} [char=' '] - Character to insert.
 * @returns {string} The indented string.
 */
export const indent = (string, length, char = ' ') => `${string.replace(/\n/g, `\n${char.repeat(length)}`)}`;

/**
 * Transform an error into a user-readable, colored string.
 *
 * @param  {Error} error - Input error.
 * @returns {string} The formatted message.
 */
export function formatError(error) {
  const { message, stack } = separateMessageFromStack(error.stack);
  const stackTrace = formatStackTrace(
    stack,
    { rootDir: dirname(dirname(__dirname)), testMatch: [] },
    { noStackTrace: false },
  );
  return `${red(message)}\n${stackTrace.replace(/\n {4}/g, '\n')}\n`;
}

/**
 * Transform an object into a user-readable, colored string. If the resulting
 * string is shorter than 200 characters, inlines it.
 *
 * @param {Object} object - The input object.
 * @returns {string} A stringified version of the object.
 */
function formatObject(object) {
  const str = stringify(object, { indent: 2, arrayIndex: false });
  return grey(stripAnsi(str).length < 200 ? str.replace(/\n */g, ' ') : `\n${str}\n`);
}

/**
 * Transform a value of any type into a user-readable, colored string.
 *
 * @param {*} value - A value of any type.
 * @returns {string} A stringified version of the value.
 */
function format(value) {
  if (value instanceof Error) {
    return formatError(value);
  }
  return typeof value === 'string' ? value : formatObject(value);
}

/**
 * Default configuration
 * @type {Log~options}
 */
export const defaultOptions = {
  levels: ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'],
  colors: [red.bold, red, red.bold, red, magenta, yellow, blue, grey],
  inverse: [true, true],
  labels: ['EMERG', 'ALERT', 'CRITI', 'ERROR', ' WARN', ' NOTE', ' INFO', 'DEBUG'],
  separator: ' • ',
  stream: level => (level <= 4 ? process.stderr : process.stdout),
  format,
  displayTime: false,
  displayTimeFormat: 'yyyy-mm-dd HH:MM:ss.l',
  level: 'info',
};

/**
 * If an option is a function, apply it with given parameters, otherwise returns it.
 *
 * @param {Function|*} option - The option bvalue or function.
 * @param {*[]} args - Arguments to call `option` with, if `option` is a function.
 * @returns {*} The return of `option(...args)`, or `option`.
 */
const applyOption = (option, ...args) => (typeof option === 'function' ? option(...args) : option);

/**
 * Fancy lightweight logging utility.
 *
 * @class

 */
export class Log {
  /**
   * Creates an instance of `Log`.
   *
   * @param {Log~options} [options={}] - Options.
   */
  constructor(options = {}) {
    /**
     * @var {Log~options} options - Logger options.
     */
    this.options = defaults({}, options, defaultOptions);

    this.options.levels.forEach((level, logLevel) => {
      /**
       * Logging method for each level of `options.levels`.
       *
       * @param {...*} parts - Any value: `string`, `Object`, `Error`, etc.
       * @returns {undefined} Nothing.
       */
      this[level] = (...parts) => this.write(logLevel, parts);
    });
  }

  /**
   * @property {number} level - Integer value of `this.options.level`.
   */
  get level() {
    return this.options.levels.indexOf(this.options.level);
  }

  /**
   * Build the header.
   *
   * @param {number} level - Level number.
   * @returns {string} The constructed header.
   */
  buildHeader(level) {
    const {
      labels, colors, inverse, displayTime, displayTimeFormat, separator,
    } = this.options;
    const time = displayTime ? grey(dateFormat(Date.now(), displayTimeFormat)) : '';
    const color = colors[level];
    const labelColor = inverse[level] ? color.inverse : color;
    const label = `${labels[level]}`;
    return `${time && grey(`${time}${separator}`)}${labelColor(label)}${color(separator)}`;
  }

  /**
   * Build the body.
   *
   * @param {*[]} parts - Parts of the message, not formatted.
   * @returns {string} The constructed body.
   */
  buildBody(parts) {
    const messages = parts.map(this.options.format);
    return messages.join(messages.some(s => s.includes('\n')) ? '\n' : ' ');
  }

  /**
   * Build the entire message.
   *
   * @param {number} level - Level number.
   * @param {*[]} parts - Parts of the message, not formatted.
   * @returns {string} The constructed message.
   */
  buildMessage(level, parts) {
    const header = this.buildHeader(level);
    const body = this.buildBody(parts);
    return `${header}${indent(body, stripAnsi(header).length)}\n`;
  }

  /**
   * Build a message and write it to the stream.
   *
   * @param {number} level - Level number.
   * @param {*[]} parts - Parts of the message, not formatted.
   * @returns {undefined} Nothing.
   */
  write(level, parts) {
    if (level > this.level) {
      return;
    }
    const stream = applyOption(this.options.stream, [level]);
    stream.write(this.buildMessage(level, parts));
  }
}

/**
 * Utility function that will create a new instance of `Log` with options taken
 * from environment variables.
 *
 * Variables:
 * - `NODE_ENV`:
 *   - `'development'` (default): `displayTime` is disabled,
 *   - `'test'`: `displayTime` is disabled, `'level'` is set to `'critical'`,
 *   - `'production'`: Use default values for each option.
 * - `LOG`: Sets `level` value.
 * - `LOG_LEVEL`: Alias for `LOG`.
 * - `LOG_TIME`: When set to `true` or `1`, enables `displayTime`.
 * - `LOG_TIME_FORMAT`: Sets `displayTimeFormat` value.
 *
 * @param {Object} [options={}] - Additional options. Will take precedence over other ones.
 * @param {Object} [env=process.env || {}] - `env` object.
 * @param {string} [environment=env.NODE_ENV || 'development'] - Environment.
 * @returns {Log} A new instance of `Log`.
 */
export function fromEnv(options = {}, env = process.env || {}, environment = env.NODE_ENV || 'development') {
  const mergedOptions = defaults(
    options,
    {
      level: env.LOG || env.LOG_LEVEL,
      displayTime: env.LOG_TIME,
      displayTimeFormat: env.LOG_TIME_FORMAT,
    },
    {
      development: { displayTime: false },
      test: { level: 'critical', displayTime: false },
    }[environment],
  );
  return new Log(mergedOptions);
}
