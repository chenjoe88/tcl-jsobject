/*
 * @tcl/jsobject -- a typed facade over raw JSON.
 *
 * The package entry stays thin: each subsystem's own index.ts carries its
 * contract (what it is for, how to use it, what not to assume). Start there.
 */

// Model
export {
    JSObject, JSCollection, JSError, JSData,
    PROP_MAIN_DATA, PROP_JSCLASS, PROP_ID, PROP_TYPE, PROP_PARENT,
    PROP_TRANSIENT_PARENT, PROP_NAME, PROP_AUX_DATA, PROP_SERIAL_TYPE,
    PROP_CREATED_DATE, PROP_UPDATED_DATE, PROP_EXPIRATION_DATE,
} from "./model";

// Types
export { JSType, JSONValue, JSONObject, JSONArray, JSClass, JSProperties } from "./types";

// Utilities
export { DataUtil, JSONUtil, Base64, MetaUtil, StringUtil, Util } from "./util";

// System
export { Logger } from "./system";
