import { Logger } from '../index';
import { LogStream } from '../system';

describe('Logger', () => {

  it('Get returns one instance per label', () => {
    const a = Logger.Get('LoggerTestA');
    const b = Logger.Get('LoggerTestA');
    const c = Logger.Get('LoggerTestB');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('Peek looks up without creating', () => {
    expect(Logger.Peek('LoggerNeverCreated')).toBeUndefined();
    Logger.Get('LoggerPeeked');
    expect(Logger.Peek('LoggerPeeked')).toBeDefined();
  });

  it('injected streams receive prefixed calls', () => {
    const lines: any[][] = [];
    const errors: any[][] = [];
    const sink: LogStream = (...args: any[]) => { lines.push(args); };
    const errSink: LogStream = (...args: any[]) => { errors.push(args); };

    const logger = new Logger('MyClass', sink, errSink);

    logger.info('load', 'ready');
    expect(lines[0][0]).toBe('MyClass.load[INFO]:');
    expect(lines[0][1]).toBe('ready');

    logger.warn('load', 'careful');
    expect(lines[1][0]).toBe('!!MyClass.load[WARN]:');

    logger.error('load', 'broken');
    expect(errors[0][0]).toBe('??MyClass.load[ERROR]:');
  });

  it('prefix omits the method segment when absent', () => {
    const lines: any[][] = [];
    const logger = new Logger('Bare', (...args: any[]) => { lines.push(args); });
    logger.log('', 'msg');
    expect(lines[0][0]).toBe('Bare[LOG]:');
  });
});
