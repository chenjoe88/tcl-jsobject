
/** The signature every log sink accepts: a prefix followed by message parts. */
export type LogStream = (...args: any[]) => void;

const _instances = new Map<string, Logger>();


/**
 * Simple logger encasulator that can be expanded in the
 * future.
 */
export class Logger {
    /** class name associated with Logger instance */
    private readonly cn: string;
    private logStream: LogStream;
    private tableStream: LogStream;
    private errorStream: LogStream;
    private traceStream: LogStream;

    /**
     *
     * @param {string} classname
     * @param {*} outStream
     * @param {*} errorStream
     * @param {*} tracer
     */
    constructor(classname:string, outStream?:LogStream, errorStream?:LogStream, tracer?:LogStream) {

        this.cn = classname;
        this.logStream = outStream ? outStream : global.console.log;
        this.tableStream = outStream ? outStream : global.console.table;
        this.errorStream = errorStream ? errorStream : global.console.error;
        this.traceStream = tracer ? tracer : global.console.trace;
    }

    /**
     *
     * @param {string} method
     * @param {string} type
     * @returns
     */
    prefix(method:string, type:string) {
        let s;
        let prefix;

        switch(type) {
            case 'ERROR':
                prefix = '??';
                break;
            case 'WARN':
                prefix = '!!';
                break;
            default:
                prefix = '';
        }

        if (method) {
            s = `${prefix}${this.cn}.${method}[${type}]:`;
        }
        else {
            s = `${prefix}${this.cn}[${type}]:`;
        }
        return s;
    } // prefix

    /**
     * Log a message classification as INFO
     *
     * @param method name of the method that is doing the logging
     * @param msg log message, with embedded variables
     * @param args variables to be merged into log message
     * @returns {void}
     */
    info(method:string, msg?:any, ...args:any):void {
        return this.logStream(this.prefix(method, 'INFO'), msg, ...args);
    }

    /**
     * Log a message without classification
     *
     * @param method name of the method that is doing the logging
     * @param msg log message, with embedded variables
     * @param args variables to be merged into log message
     * @returns {void}
     */
    log(method:string, msg?:any, ...args:any):void {
        return this.logStream(this.prefix(method, 'LOG'), msg, ...args);
    }

    /**
     *
     * @param {string} method
     * @param {string} msg
     * @param  {...any} args
     * @returns {void}
     */
    table(method:string, msg?:any, ...args:any): void {
        return this.tableStream(this.prefix(method, 'LOG'), msg, ...args);
    }

    /**
     * Log a message classified as an error
     *
     * @param method name of the method that is doing the logging
     * @param msg log message, with embedded variables
     * @param args variables to be merged into log message
     * @returns {void}
     */
    error(method:string, msg?:any, ...args:any):void {
        return this.errorStream(this.prefix(method, 'ERROR'), msg, ...args);
    }

    /**
     * Log a message classified as a WARNING
     *
     * @param method name of the method that is doing the logging
     * @param msg log message, with embedded variables
     * @param args variables to be merged into log message
     * @returns {void}
     */
    warn(method:string, msg?:any, ...args:any): void {
        return this.logStream(this.prefix(method, 'WARN'), msg, ...args);
    }

    /**
     * Log a message classified as DEBUG
     *
     * @param method name of the method that is doing the logging
     * @param msg log message, with embedded variables
     * @param args variables to be merged into log message
     * @returns {void}
     */
    debug(method:string, msg?:any, ...args:any): void {
        return this.logStream(this.prefix(method, 'DEBUG'), msg, ...args);
    }

    /**
     * Log a message classified as DEBUG
     *
     * @param method name of the method that is doing the logging
     * @param msg log message, with embedded variables
     * @param args variables to be merged into log message
     * @returns {void}
    */
    trace(method:string, msg?:any, ...args:any): void {
        this.traceStream(this.prefix(method, 'TRACE'), msg, ...args);
    }

    /**
     * Retrieve the logger instance with the given label, creating it on
     * first use. One instance exists per label.
     *
     * @param {string} label
     * @returns {Logger}
     */
    static Get(label:string): Logger {
        let instance = _instances.get(label);
        if (instance == null) {
            instance = new Logger(label);
            _instances.set(label, instance);
        }
        return instance;
    }

    /**
     * Look up the logger with the given label without creating one.
     *
     * @param {string} label
     * @returns the logger, or undefined if none was ever created
     */
    static Peek(label:string): (Logger | undefined) {
        return _instances.get(label);
    }

}

export default Logger;
