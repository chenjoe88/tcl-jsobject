import StringUtil from "../util/StringUtil";

const PROP_ECODE = 'ec';
const PROP_MSG = 'msg';
const PROP_ARGS = 'args';

// const _CLSNAME_ = 'JSError';

/**
 * This class represents errors within the package.
 *
 * It extends `Error`, so a JSError can be thrown and caught like any other:
 * `instanceof Error` holds, it carries a stack, and the tooling that
 * special-cases errors works on it. Before that it was a plain object, which
 * looked like an error and failed every test for being one -- notably
 * `expect(...).toThrow()` reporting "did not throw" for a call that plainly had.
 *
 * The code is the identity; the message is prose for a human. Compare with
 * `equals`, never by message text.
 */
export class JSError extends Error {
    [PROP_ECODE]: string;
    [PROP_MSG]: string;
    [PROP_ARGS]: string;

    /**
     *
     * @param code
     * @param msg
     * @param  args
     */
    constructor(code:string, msg:string, ...args:any) {
        super(msg);

        this.name = 'JSError';
        this[PROP_ECODE] = code;
        /*
         * The raw message is kept alongside `Error.message`, which stringifies
         * whatever it is given. Callers that passed null relied on getMessage()
         * returning null, and toString() still branches on it.
         */
        this[PROP_MSG] = msg;
        this[PROP_ARGS] = JSON.stringify(args);

        /*
         * Extending a built-in loses the prototype when compiled down to ES5,
         * which silently breaks `instanceof`. Harmless at the current ES6
         * target, and what stops this regressing if the target ever changes.
         */
        Object.setPrototypeOf(this, new.target.prototype);

        // Start the stack at the throw site, not inside this constructor.
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, new.target);
        }
    }

    get CODE() { return this[PROP_ECODE]; }
    get MSG() { return this[PROP_MSG]; }
    get ARGS() { return this[PROP_ARGS]; }

    /**
     *
     * @returns
     */
    getCode(): string {
        return this[PROP_ECODE];
    }

    /**
     *
     * @returns
     */
    getMessage(): string {
        return this[PROP_MSG];
    }

    /**
     *
     * @returns
     */
    getArgs(): any {
        return this[PROP_ARGS];
    }


    /**
     * Only return code, as this maybe used to compare
     *
     * @returns format: Error##): message with args
     */
    toString(): string {
        let _code = this.getCode();
        if (_code == null) {
            _code = '##';
        }
        const _ecode = `Error(${_code})`;
        let _template = this.getMessage();
        if (_template == null) {
            _template = `${_ecode}: [No Msg]`;
            return _template;
        }
        return StringUtil.FormatString(_template, this.getArgs());
    }

    /**
     *
     * @param {*} errorObject
     * @returns {boolean}
     */
    equals(errorObject:object): boolean {
        if (this === errorObject) {
            return true;
        }
        else if (typeof errorObject == 'number') {
            return Number(this.getCode()) == errorObject;
        }
        else if (errorObject instanceof JSError) {
            return this.getCode() == errorObject.getCode();
        }
        else if (typeof errorObject == 'string') {
            return String(this.getCode()) === errorObject;
        }
        return false;
    } // equals

    toJSON() {
        return {
            [PROP_ECODE]: this[PROP_ECODE],
            [PROP_MSG]: this[PROP_MSG],
            [PROP_ARGS]: this[PROP_ARGS]
        };
    }

}


export default JSError;
