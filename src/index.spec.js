import * as hiplog from '.';

/** @test {hiplog} */
describe('hiplog', () => {
  it('exists', () => expect(hiplog).toBeDefined());
  it("doesn't export a default", () => expect(hiplog.default).not.toBeDefined());
});

/** @test {defaultOptions} */
describe('defaultOptions', () => {
  const { defaultOptions } = hiplog;
  it('has 10 members', () => expect(Object.keys(defaultOptions).length).toBe(10));

  describe('stream', () => {
    const { stream } = defaultOptions;
    it('is a function', () => expect(stream).toBeFunction());

    const streamByLevel = level => stream(defaultOptions.levels.indexOf(level));
    it('returns stdout when level is debug', () => expect(streamByLevel('debug')).toBe(process.stdout));
    it('returns stdout when level is info', () => expect(streamByLevel('info')).toBe(process.stdout));
    it('returns stdout when level is notice', () => expect(streamByLevel('notice')).toBe(process.stdout));
    it('returns stderr when level is warning', () => expect(streamByLevel('warning')).toBe(process.stderr));
    it('returns stderr when level is error', () => expect(streamByLevel('error')).toBe(process.stderr));
    it('returns stderr when level is critical', () => expect(streamByLevel('critical')).toBe(process.stderr));
    it('returns stderr when level is alert', () => expect(streamByLevel('alert')).toBe(process.stderr));
    it('returns stderr when level is emergency', () => expect(streamByLevel('emergency')).toBe(process.stderr));
  });
});

/** @test {Log} */
describe('Log', () => {
  const { Log } = hiplog;
  it('exists', () => expect(Log).toBeDefined());

  describe('constructor', () => {
    const { defaultOptions } = hiplog;

    it('assigns defaults options', () => {
      const log = new Log();
      Object.keys(defaultOptions).forEach(
        key => expect(log.options).toHaveProperty(key, defaultOptions[key]),
      );
    });

    it('assigns given options', () => {
      Object.keys(defaultOptions).forEach((key) => {
        const value = key === 'levels' ? ['foo', 'bar'] : 'foo';
        const log = new Log({ [key]: value });
        expect(log.options).toHaveProperty(key, value);
      });
    });

    it('create one function member for each level', () => {
      const levels = ['foo', 'bar', 'baz'];
      const log = new Log({ levels });
      levels.forEach(level => expect(log[level]).toBeFunction());
    });
  });

  describe('write', () => {
    it('is called with given level by created function members', () => {
      const levels = ['foo', 'bar'];
      const log = new Log({ levels });
      log.write = jest.fn();

      levels.forEach((level, i) => {
        log[level]('baz', 'foobar');
        expect(log.write).toHaveBeenCalledTimes(1);
        expect(log.write).toHaveBeenCalledWith(i, ['baz', 'foobar']);
        log.write.mockClear();
      });
    });

    it('writes whatever is returned by buildMessage() to stream', () => {
      const levels = ['foo'];
      const log = new Log({ levels, level: levels[0] });
      log.buildMessage = () => 'bar';
      log.options.stream = { write: jest.fn() };

      log.foo();
      expect(log.options.stream.write).toHaveBeenCalledTimes(1);
      expect(log.options.stream.write).toHaveBeenCalledWith('bar');
    });

    it("doesn't write anything to stream when level is below message level", () => {
      const log = new Log({ level: 'info' });
      log.buildMessage = level => log.options.levels[level];
      log.options.stream = { write: jest.fn() };

      log.debug();
      log.info();
      expect(log.options.stream.write).toHaveBeenCalledTimes(1);
      expect(log.options.stream.write).toHaveBeenCalledWith('info');
    });
  });

  describe('buildMessage', () => {
    it('builds simple messages', () => {
      const log = new Log({ level: 'debug', displayTime: false });
      const messsages = [
        ['debug', 'messages to debug an application'],
        ['info', 'a purely informational message'],
        ['notice', 'a normal but significant condition'],
        ['warning', 'warning condition'],
        ['error', 'error condition'],
        ['critical', 'the system is in critical condition'],
        ['alert', 'action must be taken immediately'],
        ['emergency', 'system is unusable'],
      ].map(([level, ...parts]) => log.buildMessage(log.options.levels.indexOf(level), parts));
      expect(messsages).toMatchSnapshot();
    });

    it('builds messages with multiple parts', () => {
      const log = new Log({ level: 'debug', displayTime: false });
      const messsages = [
        ['debug', 'messages', 'to', 'debug', 'an', 'application'],
        ['info', 'a', 'purely', 'informational', 'message'],
        ['notice', 'a', 'normal', 'but', 'significant', 'condition'],
        ['warning', 'warning', 'condition'],
        ['error', 'error', 'condition'],
        ['critical', 'the', 'system', 'is', 'in', 'critical', 'condition'],
        ['alert', 'action', 'must', 'be', 'taken', 'immediately'],
        ['emergency', 'system', 'is', 'unusable'],
      ].map(([level, ...parts]) => log.buildMessage(log.options.levels.indexOf(level), parts));
      expect(messsages).toMatchSnapshot();
    });

    it('builds messages with non-string parts', () => {
      const log = new Log({ displayTime: false });
      const level = log.options.levels.indexOf('info');
      const messsages = [
        ['boolean:', true, false],
        ['null:', null],
        ['undefined:', undefined],
        ['number:', 1, 2, 3],
        ['regexp:', /foo/],
        ['array:', ['foo', 'bar']],
        ['object:', { foo: 'bar' }],
      ].map(parts => log.buildMessage(level, parts));
      expect(messsages).toMatchSnapshot();
    });

    it('builds messages with big objects', () => {
      const log = new Log({ displayTime: false });
      const circular = {};
      circular.inner = circular;
      const bigObject = {
        null: null,
        undefined,
        integer: 123,
        boolean: true,
        string: 'Hello',
        funtion: function myFunction() {},
        circular,
        array: ['one', 'two', 'three', 'four'],
      };
      const messsage = log.buildMessage(log.options.levels.indexOf('info'), [bigObject]);
      expect(messsage).toMatchSnapshot();
    });

    it('builds messages with errors', () => {
      const log = new Log({ displayTime: false });
      let error;
      try {
        throw new Error('LEROOOOOOOOOOOY JENKINS!!!!!!!!!!!!!!!!!!!!!!!!!');
      } catch (e) {
        error = e;
      }
      const messsage = log.buildMessage(log.options.levels.indexOf('error'), [error]);
      expect(messsage).toMatchSnapshot();
    });
  });
});

/** @test {fromEnv} */
describe('fromEnv', () => {
  const { fromEnv, defaultOptions } = hiplog;

  it('uses default options when `NODE_ENV` set to "production"', () => {
    const { options } = fromEnv({}, { NODE_ENV: 'production' });
    expect(options).toEqual(defaultOptions);
  });

  it('uses development options when `NODE_ENV` set to "development"', () => {
    const { options } = fromEnv({}, { NODE_ENV: 'development' });
    expect(options).toHaveProperty('displayTime', false);
    expect(options).toMatchSnapshot();
  });

  it('uses development options when `NODE_ENV` is not set', () => {
    const { options } = fromEnv({}, {});
    expect(options).toEqual(fromEnv({}, { NODE_ENV: 'development' }).options);
  });

  it('uses test options when `NODE_ENV` set to "test"', () => {
    const { options } = fromEnv({}, { NODE_ENV: 'test' });
    expect(options).toHaveProperty('level', 'critical');
    expect(options).toHaveProperty('displayTime', false);
    expect(options).toMatchSnapshot();
  });
});
