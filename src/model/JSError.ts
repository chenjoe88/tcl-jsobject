import StringUtil from "../util/StringUtil";

const PROP_ECODE = 'ec';
const PROP_MSG = 'msg';
const PROP_ARGS = 'args';

// const _CLSNAME_ = 'JSError';

/**
 * This class represents errors within the package
 *
 */
export class JSError {
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
        // super(undefined, JSError);
        // this.set(PROP_ECODE, code);
        // this.set(PROP_MSG, msg);
        // this.set(PROP_ARGS, JSON.stringify(args));

        this[PROP_ECODE] = code;
        this[PROP_MSG] = msg;
        this[PROP_ARGS] = JSON.stringify(args);
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
