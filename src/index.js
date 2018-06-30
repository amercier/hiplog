import {
  red, yellow, magenta, blue, grey,
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
  return `${red(message)}\n${stackTrace.replace(/\n {4}/g, '\n')}\n`;
}

function formatObject(object) {
  const str = stringify(object, { indent: 2, arrayIndex: false });
  return grey(stripAnsi(str).length < 200 ? str.replace(/\n */g, ' ') : `\n${str}\n`);
}

function format(value) {
  if (value instanceof Error) {
    return formatError(value);
  }
  return typeof value === 'string' ? value : formatObject(value);
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
  displayTimeFormat: 'yyyy-mm-dd HH:MM:ss.l',
  level: 'info',
};

const getStream = (level, { stream }) => (typeof stream === 'function' ? stream(level) : stream);

export class Log {
  constructor(options = {}) {
    // Options
    Object.assign(this, defaultConfig, options);
    this.levelValue = this.levels.indexOf(this.level);

    // Level methods
    this.levels.forEach((name, logLevel) => {
      this[name] = (...parts) => this.write(logLevel, parts);
    });
  }

  buildHeader(level) {
    const time = this.displayTime ? dateFormat(Date.now(), this.displayTimeFormat) : '';
    const color = this.colors[level];
    const labelColor = this.inverse[level] ? color.inverse : color;
    const label = `${this.labels[level]}`;
    const { separator } = this;
    return `${time && grey(`${time} ${separator}`)} ${labelColor(label)} ${color(separator)} `;
  }

  buildBody(parts) {
    const messages = parts.map(this.format);
    return messages.join(messages.some(s => s.includes('\n')) ? '\n' : ' ');
  }

  buildMessage(level, parts) {
    const header = this.buildHeader(level);
    const body = this.buildBody(parts);
    return `${header}${indent(body, stripAnsi(header).length)}\n`;
  }

  write(level, parts) {
    if (level > this.levelValue) {
      return;
    }
    getStream(level, this).write(this.buildMessage(level, parts));
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

export function fromEnvironmentVariables(
  environment = process.env.NODE_ENV,
  level = process.env.LOG || process.env.LOG_LEVEL,
  displayTime = process.env.LOG_TIME,
) {
  return new Log(Object.assign(
    { },
    configFromEnvironment(environment),
    level ? { level } : {},
    { displayTime: ['1', 'true'].indexOf(displayTime) !== -1 },
  ));
}
