// @ts-nocheck

import Logger from "../system/Logger";

const _CLSNAME_ = 'DataUtil';

const _logger = Logger.Get(_CLSNAME_);


/**
 * Utilities for variables and data structures
 *
 */
class DataUtil {


    /**
     * Null check
     *
     * @param {*} value any value
     * @return {boolean} true if null or undefined.
     *
     * @see ~NotNull
     */
    static IsNull(value) {
        return (value === null) || (value === undefined);
    }

    /**
     * Not Null check
     *
     * @param {*} value
     * @return {boolean} true if not null or undefined
     *
     * @see ~IsNull
     */
    static NotNull(value) {
        return (value !== null) && (value !== undefined);
    }


    /**
     *
     * @param {*} data
     * @param {*} type
     * @returns {boolean} true for now (no support)
     */
    static IsInstance(data, type) {
        // NOT SUPPORTED IN GENERIC NODE (no Babel)
        // return data instanceof type;
        return true;
    }


    /**
     * Assertion of value/expression being truthy and dump stack if truth
     * check failed.
     *
     * @param {boolean} expr boolean value to check for truth
     * @param {string} classname name of class where assertion originated
     * @param {string} method method name
     * @param {string} msg message
     * @param  {...any} args
     */
    static Assert(expr, classname, method, msg, ...args) {
        if (expr === true) {
            return true;
        }
        _logger.debug('Assert', msg, ...args);
        return false;
    }

    /**
     *
     * @param {*} data
     * @param {*} dataType
     * @param {Exception} exceptionObj
     * @return {boolean} return false if exception object is not provided
     */
    static AssertType(data, dataType, errorCode = null) {
        const verdict = DataUtil.IsInstance(data, dataType);

        if (verdict === true) {
            return true;
        }
        if (errorCode) {
            throw new Error(errorCode);
        } else {
            _logger.error('AssertionType', `Type (${dataType}) Error for data: ${data}`);
            return false;
        }
    }


    /**
     * Assertion of value/expression not being null and dump stack if assertion
     * failed.
     *
     * @param {*} expr any value to check against null
     * @param {string} classname name of class where assertion originated
     * @param {string} method name of function
     * @param {string} msg text message
     * @param  {...any} args
     */
    static AssertNotNull(expr, method, msg, ...args) {
        if (DataUtil.NotNull(expr)) {
            return true;
        }
        _logger.debug(method, msg, ...args);
        return false;
    }

    /**
     * Assertion of value/expression not being null and dump stack if assertion
     * failed.
     *
     * @param {*} values array of values to check each element to be not null
     * @param {string} classname name of class where assertion originated
     * @param {string} method name of function
     * @param {string} msg text message
     * @param  {...any} args
     */
    static AssertArrayNoNulls(values, classname, method, msg, ...args) {
        if (values == null) {
            return false;
        }
        let hasError = false;
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (value == null) {
                hasError = true;
            }
        }
        return !hasError;
    } // AssertArrayNoNulls

    /**
     * Assert if given object is an "instanceof" given class object and dump
     * stack if failed check.
     *
     * @param {*} object any value to check against class object
     * @param {class} classObj value on the right hand side of the "instanceof" operator
     * @param {string} classname name of class where assertion originated
     * @param {string} method name of function
     * @param {string} msg text message
     * @param  {...any} args
     */
    static AssertInstanceOf(object, classObj, classname, method, msg, ...args) {
        if (object == null) {
            return false;
        }
        if (object instanceof classObj) {
            return true;
        }
        return false;
    }


    // ------------------------------ STRINGS -------------------------------

    /**
     * Determine length of string. null means
     * zero length
     * @param {string=} s string
     * @param {boolean} trim true to trim first before checking for length
     * @return {number} 0 means empty or null
     */
    static StringLength(s, trim = false) {
        if (s == null) {
            return 0;
        }
        return (trim === true) ? s.trim().length : s.length;
    }

    /**
     * Return true if string is empty, which
     * includes null.
     *
     * @param {string=} s string or null
     * @param {boolean} trim true to trim first before checking for length
     * @return {boolean} true if string is empty or null
     */
    static StringIsEmpty(s, trim = false, nullIsEmpty = true) {
        if (s == null && (nullIsEmpty === false)) {
            return false;
        }
        return this.StringLength(s, trim) === 0;
    }

    /**
     *
     * @param {*} s
     * @return {boolean} true if string type
     */
    static IsString(s) {
        return typeof s === 'string';
    }

    /**
     *
     * @param {string} s1
     * @param {string} s2
     * @param {boolean=} ignoreCase
     * @param {boolean=} nullIsEmpty
     * @param {boolean=} trim
     * @return {boolean}
     */
    static StringEquals(s1, s2, ignoreCase = true, nullIsEmpty = false, trim = false) {
        if (trim === true) {
            s1 = (DataUtil.NotNull(s1)) ? String(s1).trim() : null;
            s2 = (DataUtil.NotNull(s2)) ? String(s2).trim() : null;
        }
        if (nullIsEmpty === true) {
            if (s1 && s1.length === 0) {
                s1 = null;
            }
            if (s2 && s2.length === 0) {
                s2 = null;
            }
        }
        if (ignoreCase === false) {
            s1 = (DataUtil.NotNull(s1)) ? String(s1).toLowerCase() : null;
            s2 = (DataUtil.NotNull(s2)) ? String(s2).toLowerCase() : null;
        }
        return s1 === s2;
    }


    /**
     *
     * @param {string[]} list1
     * @param {string[]} list2
     */
    static MergeStrings(list1, list2) {
        if (list2 == null) {
            return list1;
        }
        if (list1 == null) {
            return list2;
        }
        const merged = [...list1, ...list2];
        return DataUtil.UniqueArray(merged);
    }


    /**
     * Pad string at the start if shorter than given length
     *
     * @param {*} s string to pad if shorter than length
     * @param {*} ch character to pad. default to space
     * @param {*} length pad if shorter than this length
     */
    static StringPadStart(s, ch = ' ', length = null) {
        if (length == null) {
            return s; // bad input
        }
        if (s == null) {
            s = '';
        }
        return String(s).padStart(length, ch); // built-in function
    }

    /**
     * Insert a character/string every X number of characters
     * of the given string
     *
     * @param {string} s string to insert character
     * @param {string} ch character(s) to insert
     * @param {number} gap size of gap in character
     */
    static StringInsertDelim(s, ch, gap) {
        // not working
        const regex = new RegExp(`/.{1,${gap}/g`);
        const tokens = s.match(regex);
        return tokens ? tokens.join(ch) : s;
    }


    /**
     * Convert a string value to boolean by taking best
     * guess for the intention. values "true", "on", "yes",
     * or any positive number all means true
     *
     * @param {*} value
     * @param {boolean} defaultVal if value given is null/undefined
     * @return {boolean} boolean true or false
     */
    static toBoolean(value, defaultVal = false) {
        if (value == null) {
            return defaultVal;
        }
        if (typeof (value) === 'boolean') {
            return value;
        }
        if (typeof (value) === 'number') {
            return (value > 0);
        }
        if (typeof (value) !== 'string') {
            value = `${value}`;
        }
        switch (String(value).toLowerCase()) {
            case 'true':
            case 't':
            case '1':
            case 'on':
            case 'yes':
            case 'y':
                return true;

            case 'false':
            case 'f':
            case '0':
            case 'no':
            case 'n':
                return false;

            default:
                return defaultVal;
        }
    } // toBoolean


    /**
     * Convert a "null" string value to null
     * especially for redis serialization of null values in a hash
     *
     * @param {*} value
     * @return {null} null or original value
     */
    static toNull(value) {
        if (DataUtil.IsNull(value) || String(value).toLowerCase() === 'null') {
            return null;
        } else if (typeof (value) !== 'string') {
            value = `${value}`;
        }
        return value;
    } // toNull

    /**
     * Convert a string value to a number, catches null
     * or other exceptions and return a desired default.
     *
     * @param {*} value anything that Number() can convert to number
     * @param {number=} defaultVal if value given is null or error
     * @return {number} numeric value or defaultVal
     */
    static toNumber(value, defaultVal = null) {
        const _m = 'toNumber';
        if ((value === null) || (value === undefined)) {
            return defaultVal;
        }
        if (typeof (value) === 'number') {
            return value;
        }
        try {
            if (typeof (value) === 'string') {
                value = Number(value);
            } else {
                value = Number(String(value));
            } // justin case
            return (typeof (value) === 'number') ? value : defaultVal;
        } catch (e) {
            _logger.error('Error.', {
                err: e,
                _m
            });
            return defaultVal;
        }
    } // toNumber

    static toNumberWithRange(value, min, max, defaultVal = null) {
        value = this.toNumber(value, defaultVal);
        min = this.toNumber(min) || -Infinity;
        max = this.toNumber(max) || Infinity;

        if (value) {
            value = Math.max(value, min);
            value = Math.min(value, max);
        }

        return value;
    } // toNumber

    /**
     * Compare two values as numbers. Both will be converted
     * to Number first. This is especially useful if the two
     * values are equivalent integer but represented differently,
     * e.g., one is a string
     *
     * @param {*} v1
     * @param {*} v2
     * @returns {boolean} true if numeric representation is the same
     */
    static NumberEquals(v1, v2) {
        const n1 = DataUtil.toNumber(v1, 'b1');
        const n2 = DataUtil.toNumber(v2, 'b2');
        return n1 === n2;
    }

    /**
     * @param {string} s, the string to get from
     * @param {boolean} lowercase, convert the string to lowercase
     * @param {string} defalutvalue, if no string can be get, the default value to return
     */
    static GetString(s, lowercase = true, defaultvalue = null) {
        if (lowercase) {
            return (typeof s === 'string') ? s.trim().toLowerCase() : defaultvalue;
        }

        return (typeof s === 'string') ? s : defaultvalue;
    }


    /**
     * Strip character at the beginning and end
     * of the string that is collectively used to
     * quote or wrap the string. Beginning or end
     * must match in order for stripping to happen.
     *
     * Optionally, specify a character explicitly
     * and that will be used for stripping.
     *
     * @param {string} str string to strip wrapper
     * @param {string=} charLeft left character to look for explicitly.
     * If specified, both beginning and ending must
     * match this char.
     * @param {string=} charRight right character to look for explicitly
     * if specified. It's useful if it's not same as left char but
     * matching like brackets. If null, then will use charLeft if
     * specified.
     */
    static StripWrapper(str, charLeft = null, charRight = null) {
        const len = (str == null) ? 0 : str.length;

        const charRightMap = {
            '{': '}',
            '[': ']',
            '(': ')',
            '<': '>',
            '"': '"',
            '\'': '\'',
            '`': '`',
        };

        if (len < 2) {
            return str;
        }

        const c0 = str.charAt(0);
        if (charLeft == null) {
            charLeft = c0;
            if (charRightMap[charLeft] == null) {
                return str;
            }
        }
        if (charRight == null) {
            charRight = charRightMap[charLeft];
            if (charRight == null) {
                charRight = charLeft;
            }
        }

        if ((c0 !== charLeft) || (str.charAt(len - 1) !== charRight)) {
            return str;
        }
        str = str.substring(1, len - 1);
        return str;
    } // Stripwrapper

    /**
     * Strip prefix from the given string
     *
     * @param {string} str string to strip
     * @param {string} prefix prefix to match and strip
     * @param {boolean} ignoreCase true to match prefix
     * @return {string} string with prefix stripped if matched,
     * or else return original
     */
    static StripPrefix(str, prefix, ignoreCase = true) {
        const s = ignoreCase ? str.toLowerCase() : str;
        const p = ignoreCase ? prefix.toLowerCase() : prefix;
        if (s.indexOf(p) !== 0) {
            return str;
        }

        return str.substring(prefix.length);
    }

    /**
     * Utility to check if an object is empty
     *
     * @param {{}} o
     */
    static ObjectIsEmpty(o) {
        if (o == null) {
            return true;
        }
        return Object.entries(o).length === 0 && o.constructor === Object;
    }


    // ------------------------- VALUE STRINGS -------------------------


    /**
     * Support for insertion into the RHS of something
     * like incl="value1|value2|value3|..."
     *
     * Currently values must be unique, so redundant values will
     * not be appended
     *
     * @param {string=} valuesString current stirng, eg. "value1|value2", or null is fine
     * @param {string[]} newOptions one or more values in array, eg ["value3"]
     * @param {string} delimitor character to use to separate
     * @return {string} new value string, eg., "value1|value2|value3" or no change
     * if value already exists
     *
     * @see ~RemoveValueFromValuesString
     * @see ~HasValueInValuesString
     */
    static AddValueToValuesString(valuesString, value, delimitor = '|', uppercase = true) {
        const values = valuesString ? valuesString.split(delimitor) : [];
        if (uppercase) {
            value = value.toUpperCase();
        }
        if (values.indexOf(value) >= 0) {
            return valuesString;
        } // no change

        values.push(value);
        return values.join(delimitor);
    }

    /**
     * Remove a value from a value string like: "value1|value2|value3"
     *
     * @param {string} valueString
     * @param {string} value
     * @param {string} delmitor
     * @param {boolean} uppercase true to convert all values to upper case to compare
     *
     * @see ~AddValueToValuesString
     */
    static RemoveValueFromValuesString(valuesString, value, delimitor = '|', uppercase = true) {
        const values = valuesString ? valuesString.split(delimitor) : [];
        if (uppercase) {
            value = value.toUpperCase();
        }
        const pos = values.indexOf(value);
        if (pos < 0) {
            return valuesString;
        }

        values.splice(pos, 1);
        return values.join(delimitor);
    }

    /**
     * Given a string containing multiple values delimited, this Utility
     * offers a richer sematic/converson from regular string.split()
     *
     * @param {string} valueString
     * @param {string} delimitor
     * @param {boolean} uppercase true to convert all values to upper case
     * @return {string[]} array of all values parsed from given value string
     *
     * @see ~HasValueInValuesString
     * @see ~AddValueToValuesString
     * @see ~RemoveValueFromValuesString
     */
    static GetValuesInValuesString(valuesString, delimitor = '|', uppercase = true) {
        if (valuesString == null) {
            return [];
        }
        if (uppercase) {
            valuesString = valuesString.toUpperCase();
        }
        const values = valuesString.split(delimitor);
        return values;
    }

    /**
     * Check if a value exists in a value string like: "value1|value2|value3"
     *
     * @param {string} valueString
     * @param {string} value1 first value to check
     * @param {string} value2 optionally second value to check if first one not in
     * @param {string} delimitor
     * @return {boolean}
     *
     * @see ~GetValueInValuesString
     * @see ~AddValueToValuesString
     * @see ~RemoveValueFromValuesString
     */
    static HasValueInValuesString(valuesString, value1, value2, delimitor = '|', uppercase = true) {
        const _m = 'HasValueInValuesString';
        let values;
        try {
            if (valuesString == null) {
                return false;
            }
            if (uppercase) {
                valuesString = valuesString.toUpperCase();
            }
            values = valuesString.split(delimitor);
            if (uppercase && value1) {
                value1 = value1.toUpperCase();
            }
            if (value1 && values.includes(value1)) {
                return true;
            }
            if (uppercase && value2) {
                value2 = value2.toUpperCase();
            }
            return value2 ? values.includes(value2) : false;
        } catch (err) {
            _logger.error('Error.', {
                err,
                _m
            });
            return false;
        }
    }


    // --------------------------- ARRAYS -------------------------------


    /**
     * Make the given array list unique
     *
     * @param {[]} list array to remove exact duplicate objects
     * @return {[]} same array but minus duplicates
     */
    static UniqueArray(list) {
        if (list == null || !Array.isArray(list)) {
            return list;
        }

        const a = list; // use the same array (for now)
        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j]) {
                    a.splice(j--, 1);
                }
            }
        }

        return a;
    }

    /**
     * Takes a list that is resulted from a merge of lists returned by different get user feed functions
     * such as GetDeclaredUsertags, GetDeclaredHashtags. Then the method will remove duplicates in the list
     * but keep a record of the count of occurrence of each item and sort the result list based on the occurence
     * counts - this is an initial version of sort by relevance.
     *
     * @param {[]} list array to remove exact duplicate objects
     * @param {boolean} inc increment order?
     * @return {[]} sorted unique array
     *
     * @see TagService.GetDeclaredUsertags
     * @see TagService.GetDeclaredHashtags
     */
    static UniqueArraySortByRelevance(list, inc = false) {
        // Get tag appearance count, bigger appearance count = better relevance
        const entrymap = {};
        for (const e of list) {
            entrymap[e] = entrymap.hasOwnProperty(e) ? entrymap[e] + 1 : 1;
        }
        if (DataUtil.IsNull(entrymap)) {
            return [];
        }

        // Sort htapmap, utapmap by value (appearance count)
        const entrymap_sorted = new Map(Object.entries(entrymap).sort((a, b) => {
            if (inc) {
                return a[1] - b[1];
            }
            return b[1] - a[1];
        }));

        return Array.from(entrymap_sorted.keys());
    }

    /**
     * Take two arrays and return union
     * @param {[]} array1
     * @param {[]} array2
     * @return {[]} unique merged array
     */
    static Union2Arrays(array1, array2) {
        const s = new Set([...array1, ...array2]);
        return Array.from(s);
    }

    /**
     * Compare two arrays that goes deep
     *
     * @param {Array} list1
     * @param {Array} list2
     *
     * @return {boolean} true if values are same, false if not
     */
    static CompareArrays(list1, list2, stack = null) {
        // if the other array is a falsy value, return
        if (list1 === list2) {
            return true;
        }

        if (!list1 || !list2) {
            return false;
        }

        // compare lengths - can save a lot of time
        if (list1.length !== list2.length) {
            return false;
        }

        for (let i = 0, l = list1.length; i < l; i++) {
            // Check if we have nested arrays
            if (list1[i] instanceof Array && list2[i] instanceof Array) {
                if (stack == null) {
                    stack = new Set();
                } else if (stack.has(list1) || stack.has(list2)) {
                    // circular?
                    return false;
                }
                stack.add(list1);
                stack.add(list2);
                // recurse into the nested arrays
                if (DataUtil.CompareArrays(list1[i], list2[i], stack) === false) {
                    return false;
                }
            } else if (list1[i] !== list2[i]) {
                // Warning - two different object instances will never be equal: {x:20} !== {x:20}
                return false;
            }
        }
        return true;
    }
    /**
     * Array check
     *
     * @param {Array} a value to check
     * @return {boolean} true if value is null, non-array, or empty array (length zero)
     */
    static ArrayIsEmpty(a) {
        if (!a) {
            return true;
        }
        if (!Array.isArray(a)) {
            return true;
        }
        return a.length <= 0;
    }


    /**
     * Given an object array, return the the object that
     * has a property name that matches the given value
     *
     * @param {object[]} list array of object
     * @param {string} label property name inside objects to check
     * @param {*} value value to compare (using ==)
     * @return {*} item in list that match the label == value
     */
    static GetObjectFromArrayByValue(list, label, value) {
        const count = list ? list.length : 0;
        let result;
        let item;
        for (let i = 0; i < count; i++) {
            item = list[i];
            if (item && item[label] && (item[label] === value)) {
                result = item;
                break;
            }
        }
        return item;
    }

    /**
     * Take an array and convert to a string that quotes every element.
     * @param {Array} a array of values. elements should be string or
     * convertable to string
     * @param {string} eq element quote symobol (default to single quote)
     * @param {string} sqLeft left string quote symbol (default to double quote)
     * @param {string} sqRight right string quote symbol (default to double quote)
     * @param {string} delim delimiter between elements. (default to comma)
     * @return {string} formatted string array representation
     */
    static ArrayToQuotedString(a, eq = "'", sqLeft = '"', sqRight = '"', delim = ',') {
        if (DataUtil.ArrayIsEmpty(a)) {
            return `${eq}${eq}`;
        }

        const joiner = `${eq}${delim}${eq}`;
        const s = `${sqLeft}${eq}${a.join(joiner)}${eq}${sqRight}`;
        return s;
    }

    /**
     * Take an array and convert to JavaScript array expression, parsable
     * by JSEP.
     *
     * @param {Array} a
     * @param {string} eq element quote symbole (default to single quote)
     * @return {string} format like ['a','b','c']
     */
    static ArrayToJSString(a, eq = "'") {
        return DataUtil.ArrayToQuotedString(a, eq, '[', ']');
    }

    /**
     * Convert a (JavaScript) string expression of an array to actual strin garray
     *
     * @param {string} arrayStr string array expression like ['a','b','c']
     * @param {boolean} enforceBrackets true to return string if no square brackets found
     * @param {*} defaultVal default return value if null
     * @return {[]} array, or original string if no brackets and enforceBracket=true
     */
    static JSStringToArray(arrayStr, enforceBrackets = true, defaultVal = []) {
        if (DataUtil.StringIsEmpty(arrayStr)) {
            return defaultVal;
        }

        const len = arrayStr.length;
        const startPos = (arrayStr[0] === '[') ? 1 : 0;
        const endPos = (arrayStr[len - 1] === ']') ? len - 1 : len;
        if (enforceBrackets) {
            if (startPos !== 1 && endPos !== (len - 1)) {
                return arrayStr;
            }
        }
        const trimmedStr = arrayStr.substring(startPos, endPos);

        const result = trimmedStr.split(',');
        return result;
    }

    /**
     * Remove given item from the array. If the
     * item appears multiple times, all will be
     * removed.
     *
     * @param {[]} list array of objects (only string is tested)
     * @param {*} item item to check in list, recognizable by Array.indexOf()
     * @return {[]} same list but with item removed
     */
    static RemoveFromArray(list, item) {
        if (list == null || list.length === 0) {
            return list;
        }
        let idx = list.indexOf(item);
        while (idx >= 0) {
            list.splice(idx, 1);
            idx = list.indexOf(item);
        }
        return list;
    }


    /**
     * Convert the stringified array returned by redis to array
     *
     * @param {string} text clear text to check against hashed. No-op if already array
     * @return {[]} list result array
     */
    static Text2Array(text = '') {
        if (Array.isArray(text)) {
            return text;
        }
        const re = new RegExp(/^\[.*\]$/g);
        if (!re.test(text) || text.length < 1) {

            return text;
        }
        let result = text.slice(1, -1);
        let result_t = '';
        result = result.replace(/"/g, '');
        result_t = result.replace(',', '');
        result = result && result_t !== '' ? result.split(',') : null;
        return result || [];
    }

}

export default DataUtil;
