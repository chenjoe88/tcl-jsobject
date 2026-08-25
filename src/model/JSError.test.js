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
