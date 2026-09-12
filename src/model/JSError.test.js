import JSError from "./JSError";


const code= {
    E_UNKNOWN: "99",
    E_FILE_NOT_FOUND: "100",
    E_MISSING_PROPERTY: "101"
};

const msg = {
    E_UNKNOWN: 'Unkonwn Error',
    E_FILE_NOT_FOUND: 'File: ${filename} Not Found',
    E_MISSING_PROPERTY: 'Missing Property: ${property}',
};

describe('JSError', () => {
    let /** @type {JSError} */ err0;
    let /** @type {JSError} */ err1;
    let /** @type {JSError} */ err2;

    beforeEach(() => {
        err0 = new JSError(code.E_UNKNOWN);
        err1 = new JSError(code.E_FILE_NOT_FOUND, msg.E_FILE_NOT_FOUND);
        err2 = new JSError(code.E_MISSING_PROPERTY, msg.E_MISSING_PROPERTY);
    });

    it('Basic get/set check', () => {
        expect(err0).toEqual(new JSError(code.E_UNKNOWN));

        expect(err1.getCode()).toBe(code.E_FILE_NOT_FOUND);
        expect(err1.CODE).toBe(code.E_FILE_NOT_FOUND);
        expect(err1.getMessage()).toBe(msg.E_FILE_NOT_FOUND);
        expect(err1.MSG).toBe(msg.E_FILE_NOT_FOUND);

        expect(err1.equals(code.E_FILE_NOT_FOUND)).toBeTruthy();
        expect(err1.equals(String(code.E_FILE_NOT_FOUND))).toBeTruthy();
        expect(err1.equals(new JSError(code.E_FILE_NOT_FOUND))).toBeTruthy();

        expect(err2.getCode()).toBe(code.E_MISSING_PROPERTY);
        expect(err2.CODE).toBe(code.E_MISSING_PROPERTY);
        expect(err2.getMessage()).toBe(msg.E_MISSING_PROPERTY);
        expect(err2.MSG).toBe(msg.E_MISSING_PROPERTY);

    });




});

describe('JSError is a real Error', () => {

    /*
     * It was a plain object for a long time, which meant it looked like an
     * error everywhere except where it counted: instanceof failed, there was no
     * stack, and `expect(fn).toThrow()` reported "did not throw" for a call that
     * plainly had. Each of these is one of the things that was missing.
     */

    test('is an instance of Error', () => {
        const err = new JSError(code.E_UNKNOWN, msg.E_UNKNOWN);

        expect(err instanceof Error).toBe(true);
        expect(err instanceof JSError).toBe(true);
    });

    test('carries a stack that starts at the throw site', () => {
        const err = new JSError(code.E_UNKNOWN, msg.E_UNKNOWN);

        expect(typeof err.stack).toBe('string');
        expect(err.stack.length).toBeGreaterThan(0);
        // The constructor itself should not be the first frame.
        expect(err.stack.split(String.fromCharCode(10))[1] || '').not.toMatch(/new JSError/);
    });

    test('names itself, so a log line says what it is', () => {
        expect(new JSError(code.E_UNKNOWN, msg.E_UNKNOWN).name).toBe('JSError');
    });

    test('populates Error.message', () => {
        expect(new JSError(code.E_UNKNOWN, 'boom').message).toBe('boom');
    });

    test('can be thrown and caught as an Error', () => {
        expect(() => { throw new JSError(code.E_FILE_NOT_FOUND, 'missing'); })
            .toThrow(Error);
        expect(() => { throw new JSError(code.E_FILE_NOT_FOUND, 'missing'); })
            .toThrow(/missing/);
    });

    test('survives a rethrow through an async boundary', async () => {
        const failing = async () => { throw new JSError(code.E_UNKNOWN, 'async boom'); };

        await expect(failing()).rejects.toThrow(JSError);
        await expect(failing()).rejects.toThrow(/async boom/);
    });

    test('keeps its code through a catch', () => {
        let caught = null;
        try {
            throw new JSError(code.E_MISSING_PROPERTY, 'gone');
        } catch (err) {
            caught = err;
        }

        expect(caught.getCode()).toBe(code.E_MISSING_PROPERTY);
        expect(caught instanceof Error).toBe(true);
    });

    test('still compares by code, not by message', () => {
        const a = new JSError(code.E_UNKNOWN, 'one wording');
        const b = new JSError(code.E_UNKNOWN, 'another wording');

        expect(a.equals(b)).toBe(true);
    });

    test('keeps a null message null, rather than the string "null"', () => {
        // Error would stringify it; getMessage() is the raw value callers pass.
        const err = new JSError(code.E_UNKNOWN, null);

        expect(err.getMessage()).toBeNull();
    });

    test('serializes to the same shape as before', () => {
        const err = new JSError(code.E_UNKNOWN, 'text');

        expect(JSON.parse(JSON.stringify(err))).toEqual({
            ec: code.E_UNKNOWN,
            msg: 'text',
            args: '[]',
        });
    });
});
