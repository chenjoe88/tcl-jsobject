
const _instances = { };


/**
 * Simple logger encasulator that can be expanded in the
 * future.
 */
export class Logger {
    /** class name associated with Logger instance */
    cn: string;
    logStream: Function;
    tableStream: Function;
    errorStream: Function;
    traceStream: Function;

    /**
     *
     * @param {string} classname
     * @param {*} outStream
     * @param {*} errorStream
     * @param {*} tracer
     */
    constructor(classname:string, outStream?:Function, errorStream?:Function, tracer?:Function) {

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
    info(method:string, msg?:string, ...args:any):void {
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
    log(method:string, msg?:string, ...args:any):void {
        return this.logStream(this.prefix(method, 'LOG'), msg, ...args);
    }

    /**
     *
     * @param {string} method
     * @param {string} msg
     * @param  {...any} args
     * @returns {void}
     */
    table(method:string, msg?:string, ...args:any): void {
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
    error(method:string, msg?:string, ...args:any):void {
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
    warn(method:string, msg?:string, ...args:any): void {
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
    debug(method:string, msg?:string, ...args:any): void {
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
    trace(method:string, msg?:string, ...args:any): void {
        this.traceStream(this.prefix(method, 'TRACE'), msg, ...args);
    }

    /**
     * Retreive a logger instance with the given label,
     * with option to create.
     *
     * @param {string} label
     * @param {boolean | null} create
     * @returns {Logger}
     */
    static Get(label:string, create:boolean=true): Logger {
        // @ts-ignore
        let instance = _instances[label];
        if ((instance == null) && (create === true)) {
            // @ts-ignore
            instance = new Logger(label);
            // @ts-ignore
            _instances[label] = instance;
        }
        return instance;
    }

}

export default Logger;
