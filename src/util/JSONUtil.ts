
import EncryptorClass from 'simple-encryptor';
import DataUtil from "./DataUtil";

const ENC_INFO_KEY = 'CA@#$784#!A02dF3l9';

// @ts-ignore
const encryptor4JSON =  EncryptorClass(ENC_INFO_KEY);

class JSONUtil {

    /**
     * Count number of fields in the given object/json
     *
     * @param {{}} obj
     * @return {number} number of fields
     */
    static ObjectSize(obj:object): number {
        if (!obj) {
            return 0;
        }

        let size = 0;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }

    /**
     * Given a sequence of keys in a string path, traverse the nested json
     * and retrieve the value.
     *
     * @param {{}} jsonObj data to traverse
     * @param {string} path path of keys with delimitor
     * @param {*} defaultVal return value if value not found
     * @param {string=} delim delimitor for paths. Default is dot '.'
     *
     * @see ~GetEmbeddedJSONKeys
     */
    static GetEmbeddedJSONPaths(jsonObj:{}, path:string, defaultVal:(string|null) = null, delim:string = '.') {
        const keyArray = (path == null) ? null : String(path).split(delim);
        return (keyArray == null) ? defaultVal : this.GetEmbeddedJSONKeys(jsonObj, keyArray, defaultVal);
    }

    /**
     * Given a sequence of keys as array,traverse the nested json and return the value.
     *
     * @param {{}} jsonObj data to traverse
     * @param {string=} keyArray array of successive keys to navigate inside json
     * @return {*} either matched embedded JSON or passed in JSON if
     * path is empty
     *
     * @see ~GetEmbeddedJSONPaths
     */
    static GetEmbeddedJSONKeys(jsonObj:{}, keyArray:Array<string>, defaultVal:(string|null) = null) {
        if (!Array.isArray(keyArray)) {
            return defaultVal;
        }

        if (keyArray.length === 0) {
            return defaultVal;
        }

        const key = keyArray[0];
        // @ts-ignore
        let value = jsonObj[key];

        if (keyArray.length > 1) {
            // continue depth or return
            const subpath = keyArray.slice(1);
            if (typeof (value) === 'object') {
                value = this.GetEmbeddedJSONKeys(value, subpath);
            }
        }
        return (value == null) ? defaultVal : value;
    } // GetEmbeddedJSONKeys

    /**
     * Given an object with properties, extract a subset
     * using the inclusion and exclusion field name list.
     *
     * @param {{}} jsonObj object to extract properties from
     * @param {string[]} inFields array of property names to include
     * @param {string[]} excFields array of property names to exclude.
     * If property name is found in both include and exclude list,
     * the exclusion will win.
     * @param {*} defaultVal return this if null or empty results
     * @return {{}} new object with subset of properties
     *
     * @see ~ImportObjectFields
     */
    static ExportObjectFields(jsonObj:{}, inFields:(string[]|null) = null, exFields:(string[]|null) = null, defaultVal:any = {}): {} {
        let value;
        const results = {};
        let count = 0;
        for (const label in jsonObj) {
            if (inFields && !(inFields.includes(label))) {
                continue;
            }
            if (exFields && (exFields.includes(label))) {
                continue;
            }
            // @ts-ignore
            value = jsonObj[label];

            // @ts-ignore
            results[label] = value;
            count++;
        }
        return (count > 0) ? results : defaultVal;
    } // GetObjectFields

    /**
     * Import data into a json object
     *
     * @param {{}} jsonObj main data structure to receive the import data
     * @param {{}} importData json data to add to main data or replace
     * @param {*} override true to override, false to ignore
     * @return {{}} old data or null if none was replaced
     *
     * @see ~ExportObjectFields
     */
    static ImportObjectFields(jsonObj:{}, importData:{}, override:boolean = false): any {
        const oldData = {};
        let replaceCount = 0;
        let value;
        for (const label in importData) {
            // @ts-ignore
            value = jsonObj[label];
            if (value) {
            // @ts-ignore
            oldData[label] = value;
                replaceCount++;
            }
            // @ts-ignore
            jsonObj[label] = importData[label];
        }
        return (replaceCount > 0) ? oldData : null;
    } // ImportObjectFields


    /**
     * Manual recursive clone instead of doing
     * JSON.parse(JSON.stringify(obj)). This allows
     * filtering or in-copy changes.
     *
     * @param {object} obj
     */
    static RecursiveClone(obj:object): object {
        const clone = {};
        for (const i in obj) {
            // @ts-ignore
            if (DataUtil.NotNull(obj[i]) && typeof (obj[i]) === 'object') {
                // @ts-ignore
                clone[i] = JSONUtil.CloneObject(obj[i]);
        } else {
                // @ts-ignore
                clone[i] = obj[i];
            }
        }
        return clone;
    }

    /**
     * Clone an instance of a class. Note this
     * retains class type but does shallow copy only.
     *
     * @param {object} origInstance
     */
    static CloneInstance(origInstance:object): object {
        const newInstance = Object.assign(Object.create(Object.getPrototypeOf(origInstance)), origInstance);
        return newInstance;
    }


    /**
     * Clone object using JSON stringify and then parse.
     * This does deep copy
     *
     * @param {object} obj
     * @returns {object}
     */
    static CloneObject(obj:object): object {
        return JSON.parse(JSON.stringify(obj));
    }


    /**
     * Extract a property value from each element in array and
     * put them in its own array
     *
     * @param {{}[]} objArray
     * @param {string} label property label to get data from
     * @return {*[]} array of values, or null if input array is null
     */
    static ExtractFieldFromObjects(objArray:object[], label:string, keepNull:boolean = true): (object[] | null) {
        if (objArray == null) {
            return null;
        }

        const arraySize = objArray ? objArray.length : 0;
        let value;
        const valueArray = [];
        let obj;
        for (let i = 0; i < arraySize; i++) {
            obj = objArray[i];
            // @ts-ignore
            value = obj[label];
            if (value == null && (keepNull === false)) {
                continue;
            }
            valueArray.push(value);
        }
        return valueArray;
    } // ExtractFieldFromObjects

    // ------------------------- ENCRYPTION ----------------------------------

  /**
   * Encrypt the content using the key for info object
   *
   * @param {*} data can be JSON
   * @return {string} encrypted string
   */
  static EncryptJSON(data: any) {
    return encryptor4JSON.encrypt(data);
  }

  /**
   * Decrypt the content using the key for info object
   *
   * @param {string} encryptedData
   * @return {{}} data as a string
   */
  static DecryptJSON(encryptedData: string) {
    return encryptor4JSON.decrypt(encryptedData);
  }

} // class JSONUtil

export default JSONUtil;
