import {
  red, yellow, magenta, blue, grey, bold,
} from 'chalk';
import dateFormat from 'dateformat';
import { separateMessageFromStack, formatStackTrace } from 'jest-message-util';
import { dirname } from 'path';
import { stringify } from 'purdy';
import stripAnsi from 'strip-ansi';

export const indent = (string, length, char = ' ') => `${string.replace(/\n/g, `\n${char.repeat(length)}`)}`;

export function formatError(error) {
  const { message, stack } = separateMessageFromStack(error.stack);
  const stackTrace = formatStackTrace(
    stack,
    { rootDir: dirname(dirname(__dirname)), testMatch: [] },
    { noStackTrace: false },
  );
  return `${red(message)}\n${stackTrace.replace(/\n */g, '\n')}\n`;
}

function formatObject(object) {
  const str = stringify(object, { indent: 2, arrayIndex: false });
  return grey(stripAnsi(str).length < 200 ? str.replace(/\n */g, ' ') : `\n${str}\n`);
}

export function format(value) {
  if (value instanceof Error) {
    return formatError(value);
  }
  switch (typeof value) {
    case 'object': return formatObject(value);
    case 'string': return value;
    case 'null': return bold(value);
    case 'undefined': return grey(value);
    default: return yellow(value);
  }
}

export const defaultConfig = {
  levels: ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'],
  colors: [red.bold, red, red.bold, red, magenta, yellow, blue, grey],
  inverse: [true, true],
  labels: ['EMERG', 'ALERT', 'CRITI', 'ERROR', ' WARN', ' NOTE', ' INFO', 'DEBUG'],
  separator: '•',
  stream: level => (level <= 4 ? process.stderr : process.stdout),
  format,
  displayTime: true,
  level: 'info',
};

export class Log {
  constructor(options = {}) {
    // Options
    Object.assign(this, defaultConfig, options);
    this.levelValue = this.levels.indexOf(this.level);

    // Level methods
    this.levels.forEach((name, logLevel) => {
      this[name] = (...args) => this.print(logLevel, ...args);
    });
  }

  print(level, ...args) {
    if (level <= this.levelValue) {
      const time = this.displayTime ? dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss.l') : '';
      const color = this.colors[level];
      const labelColor = this.inverse[level] ? color.inverse : color;
      const label = `${this.labels[level]}`;
      const messages = args.map(this.format);
      const message = messages.join(messages.some(s => s.includes('\n')) ? '\n' : ' ');
      const stream = typeof this.stream === 'function' ? this.stream(level) : this.stream;
      const { separator } = this;
      const header = `${time && grey(`${time} ${separator}`)} ${labelColor(label)} ${color(separator)} `;
      stream.write(`${header}${indent(message, stripAnsi(header).length)}\n`);
    }
  }
}

export function configFromEnvironment(
  environment = 'development',
  aliases = { testing: 'test', staging: 'production' },
  defaults = {
    development: { level: 'info', displayTime: false },
    production: { level: 'info' },
    test: { level: 'critical', displayTime: false },
  },
) {
  const alias = aliases[environment];
  if (alias) {
    return configFromEnvironment(alias, defaults, aliases);
  }
  return defaults[environment];
}

export function fromEnvironment(...args) {
  return new Log(configFromEnvironment(...args));
}
