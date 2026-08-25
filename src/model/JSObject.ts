
import { JSClass, JSProperties, JSType } from "./JSTypes";
import Util from "../util/Util";
import Base64 from "../util/Base64";
import DataUtil from "../util/DataUtil";
import JSONUtil from "../util/JSONUtil";
import MetaUtil from "../util/MetaUtil";
import Logger from "../system/Logger";
import JSError from "./JSError";

export const PROP_MAIN_DATA = 'data';
export const PROP_JSCLASS = '_c_';
export const PROP_ID = '_id_';
export const PROP_TYPE = '_t_';
export const PROP_PARENT = '_p_';
export const PROP_TRANSIENT_PARENT = '_xp_';
export const PROP_NAME = 'name';
export const PROP_AUX_DATA = 'aux';
export const PROP_SERIAL_TYPE = 'serial';
export const PROP_CREATED_DATE = 'ts';
export const PROP_UPDATED_DATE = 'updated';
export const PROP_EXPIRATION_DATE = 'exp_date';

const JSTYPE_OBJECT = 'JSObject';
const _CLSNAME_ = 'JSObject';
const _logger = Logger.Get(_CLSNAME_);


export interface JSData {
    [PROP_ID]?: string,
    [PROP_TYPE]?: string,
    [PROP_NAME]?: string,
    [PROP_CREATED_DATE]?: number,
    [PROP_UPDATED_DATE]?: number
};

/**
 * Javascript Object - base class to wrap
 * all JSON data and use in an object-oriented
 * way.
 */
export class JSObject {
    [PROP_MAIN_DATA]: JSData = {};
    [PROP_AUX_DATA]: (JSData | undefined) = undefined;
    [PROP_JSCLASS]: (JSClass | undefined) = undefined;
    [PROP_TRANSIENT_PARENT]: (JSObject | undefined) = undefined;
    [PROP_SERIAL_TYPE]: (string | undefined) = undefined;

    public static PROP_ID = PROP_ID;
    public static PROP_TYPE = PROP_TYPE;
    public static PROP_PARENT = PROP_PARENT;
    public static PROP_CLASS = PROP_JSCLASS;
    public static PROP_NAME = PROP_NAME;
    public static PROP_MAIN_DATA = PROP_MAIN_DATA;
    public static PROP_AUX_DATA = PROP_AUX_DATA;
    public static PROP_CREATED_DATE = PROP_CREATED_DATE;
    public static PROP_UPDATED_DATE = PROP_UPDATED_DATE;
    public static PROP_EXPIRATION_DATE = PROP_EXPIRATION_DATE;


    /**
     * Base constructor. Must be called via super() by direct subclasses.
     *
     * @param jsonData initial data object for which this sub/class is to wrap
     * @param classObj subclass' Class object
     * @param typeID explicitly specify the type identifier to be embedded
     * in the JSON structure and for reverse lookup
     */
    constructor(jsonData?:JSData, classObj:JSClass=JSObject, typeID?:JSType) {
        if (jsonData) {
            this[PROP_MAIN_DATA] = jsonData;
        }

        if (classObj != null) {
            this._setClass(classObj);
        }
        if (typeID == null) {
            // @ts-ignore
            typeID = classObj.GetTypeID();
            if (typeID == null) {
                _logger.trace('_c', 'Class has no type!', classObj);
                typeID = JSTYPE_OBJECT;
            }
        }
        this._setTypeID(typeID);
    }

    /**
     * Initialize content of this object as if it's
     * a brand new object. Just calling the constructor
     * does not necessarily mean the instance will be
     * setup as new. This method should be overridden and
     * propagate up to performed cascaded initialization.
     *
     * @param properties
     */
    initNew(properties?:JSProperties) {
        // no properties at this level (yet)
    }

    /**
     * Return Javascript class object for this instance.
     * If class object is set during initialization as a
     * property (PROP_JSCLASS), then we'll use it. Otherwise,
     * we'll use the static method declared closest to
     * the instance from the inheritance perspective.
     *
     * It's best that each class declares "static GetClass()"
     * and return that class itself.
     *
     * @return class object associated with this instance.
     */
    getClass(): JSClass {
        let rightClassObj;
        if (this[PROP_JSCLASS]) {
            rightClassObj =this[PROP_JSCLASS];
        }
        else {
            // @ts-ignore
            rightClassObj = this.constructor.GetClass();
        }
        return rightClassObj;
    }

    /**
     * Track corresponding Javascript class for which this
     * instance is an 'instanceof'. This is an override
     * as
     *
     * @param {class} classObj
     */
    _setClass(classObj:Function): void {
        this[PROP_JSCLASS] = classObj;
    }

    /**
     * Return name of the class. Note we are using
     * the name property from the constructor, rather
     * than the static method GetClass()
     *
     * @return name of this class
     */
    getClassname(): string {
        return this.constructor.name;
    }

    /**
     * TypeID set from GettypeID() during class registration
     *
     * @return {string} type string stored in PROP_TYPE
     */
    getType(): (JSType|null) {
        const data = this.getData(false);
        let type = data ? data[PROP_TYPE] : null;
        if (type == null) {
            type = MetaUtil.DetermineClassType(this.getClass());
        }
        return type;
    }

    /**
     *
     * @param {string} idVal
     * @returns {string | null}
     */
    _setId(idVal:string): string {
        // @ts-ignore
        return this.getClass().SetId(this.getData(true), idVal);
    }

    _clearId(): any {
        const data = this.getData(false);
        // @ts-ignore
        return data ? this.getClass().ClearId(data) : null;
    }

    /**
     * Return the identifier of this object.
     *
     * @param defaultVal
     * @return string identifer
     */
    getId(defaultVal:any = null): string {
        return this.get(PROP_ID, defaultVal);
    }

    /**
     * Internal function to set the "type" property in the wrapped
     * JSON object. This is normally called with initNew()
     *
     * @param {JSType} typeID optional. If not specified then will try to determine
     * @returns {boolean} true if setting type ID successfully
     */
    _setTypeID(typeID: JSType): boolean {
        const _m = '_setTypeID';
        if (typeID == null) {
            // @ts-ignore
            typeID = MetaUtil.DetermineClassType(this.getClass());
            if (typeID == null) {
                const cname = this.getClassname();
                _logger.error('_setTypeID', `Cannot determine type. Class ${cname}'s GetTypeID() returns null! Class constructor: `);
                return false;
            }
        }

        const data = this.getData(true);
        if (data[PROP_TYPE] == null) { // can inherit
            data[PROP_TYPE] = typeID;
            return true;
        }

        if (typeID && data[PROP_TYPE] !== typeID) {
            // _logger.warn(_m, "Overriding instance type: ",
            //     data[JSObject.PROP_TYPE], " with type: '" + type + "'");
            data[PROP_TYPE] = typeID;
            return true;
        }
        return false;
    } // _setTypeID

    /**
     *
     * @param {string} name
     * @returns {boolean} true if set OK, false if not
     */
    setName(name:string): boolean {
        const data = this.getData(true);
        return JSObject.SetName(data, name);
    }

    /**
     *
     * @param {*} defaultVal
     * @returns {string}
     */
    getName(defaultVal:any=null): string {
        const data = this.getData(false);
        return data ? JSObject.GetName(data, defaultVal) : defaultVal;
    }


    /**
     * Retrieve the embedded data wrapped by this object
     *
     * @param {boolean} create true
     * @return {JSData}
     */
    getData(create:boolean = false): JSData {
        if (this[PROP_MAIN_DATA] == null && create) {
            this[PROP_MAIN_DATA] = {};
            _logger.warn('getData', 'delayed creation of data content');
        }
        return this[PROP_MAIN_DATA];
    }

    /**
     * Replace embedded data wrapped by this object.
     *
     * WARNING: This will unconditionally replacing
     * existing data.
     *
     * @param data complete JSON content replacement
     *
     * @return previous data if any
     *
     */
    setData(data: JSData): JSData {
        if (this[PROP_MAIN_DATA] === data) {
            return data;
        }

        const prevData = this[PROP_MAIN_DATA];
        this[PROP_MAIN_DATA] = data;
        this.setDirty();
        return prevData;
    }

    /**
     * Return a fully cloned (deep copied) version
     * of the JSON data wrapped by this object.
     *
     * @return cloned data, or null if there is
     * no data wrapped by this object
     *
     * @see #getData()
     * @see JSObject#CloneData()
     */
    cloneData(): JSData {
        const data = this.getData(false);
        if (data == null) {
            // @ts-ignore
            return null;
        }
        return JSObject.CloneData(data);
    }


    /**
     * Clone an instance of this object, including the wrapper class.
     */
    cloneInstance(): object {
        const newObj = JSObject.CloneInstance(this);

        // do some tweaking that cannot be done at static method level?

        return newObj;
    }

    //
    // This section has the getter/setter for embedded objects and their fields
    //


    /**
     * A "get" method that will try to wrap the retrieved value if it's
     * a JSON object with a type property, or forced wrap.
     *
     * @param label property label
     * @param classObj optional: in case JSON does not have property PROP_TYPE (_t)
     * @param defaultVal
     * @return instance of JSObject subclass
     */
    getWrapped(label:string, classObj?:JSClass, defaultVal?:any): JSObject {
        const jsonObj = this.get(label, null);
        if (jsonObj == null) {
            return defaultVal;
        }
        return jsonObj ? JSObject.Wrap(jsonObj, classObj) : defaultVal;
    }

    /**
     * A "set" method that will try to wrap the given value
     *
     * @param label property label
     * @param wrappedObj object to set into a property field. Can
     * be wrapped or straight JS object/map
     * @returns previous value
     */
    setWrapped(label:string, wrappedObj:JSObject): JSObject {
        const prevObj = this.get(label, false);
        if (prevObj !== wrappedObj) {
            const unwrapped = JSObject.Unwrap(wrappedObj);
            this.set(label, unwrapped);
        }
        return prevObj;
    }

    /**
     * "Get" method for direct property on this object, which
     * is outside of the JSON content that this wraps.
     *
     * @param label property name
     * @param create true to create an empty object if it doesn't exist
     * @return existing or new object, or undefined/null
     *
     * @see #getWrapped
     * @see #setObject
     */
    getObject(label: string, create:boolean = false): any {
        // @ts-ignore
        let objData = this[label];
        if ((objData == null) && create) {
            objData = {};
            // @ts-ignore
            this[label] = objData;
        }
        // @ts-ignore
        return this[label];
    }

    /**
     * Set the value of a property directly on this wrapper
     * object and outside of the JSON content that this wraps.     *
     *
     * @param label
     * @param jsonObj
     * @return previous set json object
     *
     * @see #getObject
     */
    setObject(label:string, jsonObj:object): object {
        // complete replacement
        jsonObj = JSObject.Unwrap(jsonObj);
        let prevObj = null;

        // @ts-ignore
        if (this[label] !== jsonObj) {
            // @ts-ignore
            prevObj = this[label];
            // @ts-ignore
            this[label] = jsonObj;
            this.setDirty();
        }
        return prevObj;
    }


    // .................... Auxillary data ............................

  /**
   * Retrieve the auxillary (json) data wrapped by this object.
   * The content of the AUX can be object type
   *
   * @see JSObject#getAuxValue
   */
  getAuxData(create:boolean = false): JSData {
    if (this[PROP_AUX_DATA] == null && create) {
      this[PROP_AUX_DATA] = {};
      // this.warn("getAuxData", "delayed creation of data content");
    }
    // @ts-ignore
    return this[PROP_AUX_DATA];
  }

  /**
   * Return the AUX data, but attempt to wrap it. This works
   * if there is a "type" value that is registered inside the
   * json object.
   *
   * @param {any} defaultVal
   */
  getWrappedAuxData(defaultVal:any = null): JSObject {
    const data = this.getAuxData(false);
    return data ? JSObject.Wrap(data) : data;
  }
  /**
   * Replace auxillary data wrapped by this object
   *
   * @param {{}} data arbitrary data to associate with object
   * @return {boolean} true if replaced, false if not replaced (e.g., same)
   *
   * @see JSObject#getAuxData
   */
  setAuxData(data:{}): boolean {
    const json = JSObject.Unwrap(data);    // just in case
    if (this[PROP_AUX_DATA] === json) {
        return false;
    }

    this[PROP_AUX_DATA] = json;
    return true;
  }

  /**
   * Merge given object into the existing aux data object,
   * if any.
   *
   * @param {{}} newData
   * @return {PSData} complete aux data with the addition
   */
  addAuxData(newData: {}): JSData {
    let existingAuxData:JSData = this.getAuxData(true);
    let newAuxData:JSData = { ...existingAuxData, ...newData };
    this[PROP_AUX_DATA] = newAuxData;
    return newAuxData;
  }

  /**
   * Clear AUX data
   */
  clearAuxData() {
    if (this[PROP_AUX_DATA]) {
        delete this[PROP_AUX_DATA];
    }
  }

  /**
   * Set a value to a field within the AUX data. This
   * instead of using setAuxData() to set entire
   * json object and not just afield.
   *
   * @param {string} field field name to set value in
   * @param {any} value if XObjec then will be unwrapped
   * @return {any} previous value
   */
  setAuxDataField(field:string, value:any): any {
    value = JSObject.Unwrap(value);
    const auxData = this.getAuxData(true);
    return JSObject.SetObjectField(auxData, field, value);
  }

  /**
   * Get what's stored in a field within the AUX data.
   * Note: data will not be wrapped
   *
   * @param {string} field name of field in aux data section
   * @param {any} defaultVal
   * @return {any} previous value
   */
  getAuxDataField(field:string, defaultVal:any = null): any {
    const auxData = this.getAuxData(false);
    return auxData ? JSObject.GetObjectField(auxData, field, defaultVal) : defaultVal;
  }

  /**
   * Set an XObject instance to a field within the AUX data. This
   * instead of using setAuxData() to set entire json object
   * carrying a type that is a subclass of XObject
   *
   * @param field field name to set value in
   * @param jsobject JSObject as value (will be unwrapped)
   * @return previous value
   */
  setAuxDataJSField(field:string, jsobject:JSObject): JSData {
    const auxData = this.getAuxData(true);
    return JSObject.SetJSObjectField(auxData, field, jsobject);
  }

  /**
   *
   * @param field name of field in aux data section
   * @param defaultVal
   * @return wrapped data if it has a type that is subclass of XObject
   */
  getAuxDataJSField(field:string, defaultVal?:any): JSObject {
    const auxData = this.getAuxData(false);
    return auxData ? JSObject.GetJSObjectField(auxData, field, defaultVal) : defaultVal;
  }

  /**
   * @param field
   * @return true if cleared
   */
  clearAuxDataField(field:string): boolean {
    const auxData = this.getAuxData(false);
    return auxData ? JSObject.ClearObjectField(auxData, field) : false;
  }



    // ................. Field specific operations .................

    /**
     * Used for property watching subscription. Watching properties
     * under MAIN_DATA require pre-pending and this helps with that.
     *
     * @param topLabel
     * @param field
     * @return
     */
    getJSPropertyPath(topLabel:string, field:string): string {
        if (topLabel == null) {
            topLabel = PROP_MAIN_DATA;
        }
        return `${topLabel}.${field}`;
    }

    /**
     * Setting a field (property) of an immediate embedded object/json
     * inside this instance.
     *
     * NOTE: value will only be replaced if it's not identicial using  !==
     *
     * @param label property name of the embedded object
     * @param field property name of the field inside the embedded object
     * @param value
     * @return old value
     *
     * @see ~setField
     * @see JSObject#SetObjectField
     * @see ~importObjectFields
     */
    setObjectField(label:string, field:string, value:any): any {
        // _logger.log("setObjectField", `label=${label}, field=${field}, value=${value}`);

        // @ts-ignore
        const oldValue = this.getClass().SetObjectField(this.getObject(label, true), field, value);
        if (oldValue !== value) {
            this.setDirty();
            const propname = this.getJSPropertyPath(label, field);
            // this._dispatchHandlers(propname, oldValue, value);
        }
        return oldValue;
    } // setObjectField

    /**
     * Setting a field (property) of an immediate embedded JSObject instance
     * inside this instance. The actual stored data is the json data stored in
     * the JSObject instance.
     *
     * @param label property name of the embedded object
     * @param field property name of the field inside the embedded object
     * @param jsobj wrapped instance for which it's json data is to be embedded
     *
     * @see ~setObjectField
     * @see ~setX
     */
    setJSObjectField(label:string, field:string, jsobj:JSObject): JSObject {
        // @ts-ignore
        const oldValue = this.getClass().SetJSObjectField(this.getObject(label, true), field, jsobj);

        // Can't really compare...
        if (oldValue !== jsobj) {
            this.setDirty();
            const propname = this.getJSPropertyPath(label, field);
            // this._dispatchHandlers(propname, oldValue, xobj);
        }
        return oldValue;
    }

    /**
     * Import multiple values into this object's content
     *
     * @param props
     * @param override true to override existing
     * @return
     */
    importObjectFields(props:{}, override:boolean = false): {} {
        const data = this.getData(true);

        // @ts-ignore
        const replacedData = this.getClass().ImportObjectFields(data, props, override);
        if (replacedData && replacedData.keys && replacedData.keys.length > 0) {
            this.setDirty();
        }
        return replacedData;
    }

    /**
     * Return JSON value at the given field.
     *
     * @param label
     * @param field
     * @param defaultVal
     * @return json object
     */
    getObjectField(label:string, field:string, defaultVal:any = null): any {
        const obj = this.getObject(label, false);
        if (obj == null) {
            return defaultVal;
        }
        // @ts-ignore
        return this.getClass().GetObjectField(obj, field, defaultVal);
    } // getObjectField

    /**
     * Return JSON value at the given field,
     * but wrap first as JSObject instance before returning.
     *
     * @param label
     * @param field
     * @param defaultVal
     * @return wrapped instance or defaultVal
     */
    getJSObjectField(label:string, field:string, defaultVal:any = null): JSObject {
        const obj = this.getObject(label, false);
        if (obj == null) {
            return defaultVal;
        }
        // @ts-ignore
        return this.getClass().GetJSObjectField(obj, field, defaultVal);
    } // getObjectField

    /**
     * Check if a field inside a json property exists
     *
     * @param label key to json property
     * @param field property label to find inside the json property
     * @param existOK if true, check stops at property exists.
     * if false, then the value associated with propety will be checked for not null or undefined
     * @return true if field (property/key) exists within the given object,
     * unless existOK is set to false for which the actual value is checked.
     *
     */
    hasObjectField(label:string, field:string, existOK:boolean = true): boolean {
        const obj = this.getObject(label, false);
        if (obj == null) {
            return false;
        }
        // @ts-ignore
        return this.getClass().HasObjectField(obj, field, existOK);
    } // hasObjectField

    /**
     * Clear the value of a field of an immediate embedded object/json
     * inside this instance.
     *
     * @param label property label of the contained object
     * @param field field within the contained object
     * @returns true if field cleared
     */
    clearObjectField(label:string, field:string): boolean {
        const obj = this.getObject(label, false);
        if (obj == null) {
            return false;
        }
        // @ts-ignore
        const cleared = this.getClass().ClearObjectField(obj, field);
        if (cleared) {
            this.setDirty();
            const propname = this.getJSPropertyPath(label, field);
            // this._dispatchHandlers(propname, null, null);
        }
        return cleared;
    } // clearObjectField

    /**
     * Given an object with properties, extract a subset
     * using the inclusion and exclusion field name list.
     *
     * @param inFields array of property names to include
     * @param excFields array of property names to exclude.
     * If property name is found in both include and exclude list,
     * the exclusion will win.
     * @return new json object with subset of properties
     */
    getObjectFields(inFields:string[], exFields:string[]): JSData {
        const data = this.getData(false);
        return data ? JSObject.GetObjectFields(data, inFields, exFields) : [];
    }

    /**
     * Setting a field (property) of an immediate embedded object/json
     * with a converted base64 value
     *
     * NOTE: value will only be replaced if it's not identicial using  !==
     *
     * @param label property name of the embedded object
     * @param field property name of the field inside the embedded object
     * @param value
     * @return old value
     *
     * @see JSObject#SetObjectField
     * @see ~importObjectFields
     */
    setBase64Field(label:string, field:string, value:any): any {
        const oldValue = JSObject.SetBase64Field(this.getObject(label, true), field, value);
        if (oldValue !== value) {
            this.setDirty();
        }
        return oldValue;
    }

    /**
     * Return an embedded object (json)'s value decoded using base64 algorithm
     *
     * @param label
     * @param field
     * @param defaultVal
     * @return field value
     */
    getBase64Field(label:string, field:string, defaultVal:any = null): any {
        const obj = this.getObject(label, false);
        if (obj == null) {
            return defaultVal;
        }
        return JSObject.GetBase64Field(obj, field, defaultVal);
    }

    /**
     * Setting a field (property) of an immediate embedded object/json
     * proceeded with an encryption
     *
     * NOTE: value will only be replaced if it's not identicial using  !==
     *
     * @param label property name of the embedded object
     * @param field property name of the field inside the embedded object
     * @param value
     * @return old value
     *
     * @see JSObject#GetObjectField
     * @see JSObject#importObjectFields
     */
    setEncryptedField(label:string, field:string, value:any): any {
        const oldValue = JSObject.SetEncryptedField(this.getObject(label, true), field, value);
        if (oldValue !== value) {
            this.setDirty();
        }
        return oldValue;
    }

    /**
     * Return an embedded object (json)'s encrypted value decrypted
     *
     * @param label
     * @param field
     * @param defaultVal
     * @return decrypted
     */
    getEncryptedField(label: string, field: string, defaultVal?:any): any {
        const obj = this.getObject(label, false);
        if (obj == null) {
            return defaultVal;
        }
        return JSObject.GetEncryptedField(obj, field, defaultVal);
    }

    /**
     * Track a object designated as the parent container of this.
     * This is transient tracking and won't be saved.
     *
     * @param {JSObject} jsobject designated parent object to track
     * as direct property of this instance in memory (not persistent)
     *
     * @see ~setXParent
     */
    setTransientJSParent(jsobject: JSObject) {
        this[PROP_TRANSIENT_PARENT] = jsobject;
    }

    /**
     * Retrieve a (transient) tracked parent object.
     *
     */
    getJSParent(defaultVal?:any): JSObject {
        return this[PROP_TRANSIENT_PARENT] ? this[PROP_TRANSIENT_PARENT] : defaultVal;
    }

    /**
     * Set the parent property to the id of the parent.
     * And track the parent object as a transient via immediate
     * property.
     *
     *
     * @param jsobject object to reference as parent
     * @return previous parent if any, or null
     */
    setJSParent(jsobject: JSObject): JSObject {
        let retval = this.getJSParent(null);
        if (jsobject) {
            // let parentId = JSObject.GetId(xobj); // in case it's only json
            // retval = this.set(JSObject.PROP_PARENT, parentId);
            this.setTransientJSParent(jsobject);
        } else {
            // @ts-ignore
            retval = null;
        }

        // @ts-ignore
        return retval;
    }

    /**
     * Retrieve parent Id. If null as a json property,
     * then check if it is tracked as a transient.
     *
     * @param defaultVal if no Id is found
     * @return parent object Id or default value
     */
    getJSParentId(defaultVal?:any): string{
        let parentId = this.get(JSObject.PROP_PARENT, null);
        if (parentId == null) {
            const pobj = this.getJSParent(null);
            if (DataUtil.NotNull(pobj)) {
                parentId = JSObject.GetId(pobj);
            }
        }
        return parentId || defaultVal;
    }


    // Getters and setts for the main streamable content

    /**
     * Return all field names (JSON keys) of the first level
     * JSON object fields.
     *
     * @return list of field labels
     */
    getLabels(): string[] {
        const data = this.getData(false);
        return (DataUtil.NotNull(data)) ? Object.keys(data) : [];
    }

    // ---------------- BASIC GETTER and SETTER on Fields --------------------

    /**
     * Set a field/value entry into the main data json
     *
     * @param field property name (or key) inside the JSON data object
     * @param value
     * @return previous Value
     */
    set(field:string, value:any): any {
        return this.setObjectField(PROP_MAIN_DATA, field, value);
    }

    /**
     * Set value to a field from JSObject
     *
     * @deprecated redundant?
     *
     * @param field name
     * @param jsobject object to set to the field/property
     * @return previous value
     *
     */
    setFromJSObject(field:string, jsobject:JSObject): JSObject {
        return this.setJSObjectField(PROP_MAIN_DATA, field, jsobject);
    }

    /**
     * Return the value of the field defined in the main dat ajson
     *
     * @param field
     * @param defaultVal
     * @return value
     *
     * @see #getEmbedded
     * @see #getMultiple
     */
    get(field:string, defaultVal:any = null): any {
        return this.getObjectField(PROP_MAIN_DATA, field, defaultVal);
    }

    /**
     * Retrieve the property value wrapped as a JSObject, if its
     * type is registered and wrappable.
     *
     * @deprecated redundant?
     *
     * @param field
     * @param defaultVal
     * @return wrapped json data
     */
    getAsJSObject(field: string, defaultVal?:any): JSObject {
        return this.getJSObjectField(PROP_MAIN_DATA, field, defaultVal);
    }

    /**
     * Check if a property exists or has null value
     *
     * @param field key to property value
     * @param existOK if true, check stops at property exists.
     * if false, then the value associated with propety will be checked for not null or undefined
     * @return true if field (property/key) exists within the given object,
     * unless existOK is set to false for which the actual value is checked.
     *
     */
    has(field:string, existOK:boolean=true): boolean {
        return this.hasObjectField(PROP_MAIN_DATA, field, existOK);
    }

    /**
     * Get Embedded value
     *
     * Given a path separated by dot ".", navigate into embedded json
     * structures to retrieve the value associate with the path.
     *
     * @param path format of "key1.key2.key3"
     * @param defaultVal value to return if real value not found
     *
     * @see #get
     * @see #getm
     */
    getEmbedded(path:string, defaultVal?:any): any {
        const data = this.getData(false);
        if (!data) {
            return defaultVal;
        }
        const value = JSONUtil.GetEmbeddedJSONPaths(data, path);

        return value;
    }

    /**
     * Retrieve multiple values for a list of given fields
     *
     * @param fields list of property names. If null, use all field names
     * @param default value when no value exist for the field
     * @return corresponding array for values, if no value, defaultVal
     * is used. null is returned if given field array is not an array
     *
     * @see #getLabels()
     */
    getMultiple(fields:string[], defaultVal?:any): string[] {
        if (fields == null) {
            fields = this.getLabels();
        }
        if (!Array.isArray(fields)) {
            // @ts-ignore
            return null;
        }
        const len = fields.length;
        let name;
        let value;
        const values = [];
        for (let i = 0; i < len; i++) {
            name = fields[i];
            value = (DataUtil.NotNull(name)) ? this.get(name, defaultVal) : defaultVal;
            values.push(value);
        }
        return values;
    }

    /**
     * Return the field value as a boolean type.
     *
     * @param field
     * @param defaultVal
     * @returns
     */
    getBoolean(field:string, defaultVal:boolean=false): boolean {
        const val = this.get(field, null);
        return DataUtil.toBoolean(val, defaultVal);
    }

    /**
     * Return a field value as a number
     *
     * @param field
     * @param defaultVal
     * @return
     */
    getNumber(field:string, defaultVal?:any): number {
        const val = this.get(field, null);
        return val ? DataUtil.toNumber(val, defaultVal) : defaultVal;
    }

    /**
     * Set a field/value entry into the main data json
     *
     * @param field
     * @param value
     * @return old Value
     */
    setBase64(field:string, value:any): any {
        return this.setBase64Field(PROP_MAIN_DATA, field, value);
    }

    /**
     * Return the value of the field defined in the main dat ajson
     *
     * @param field
     * @param defaultVal
     * @return value
     */
    getBase64(field:string, defaultVal?:any): any {
        return this.getBase64Field(PROP_MAIN_DATA, field, defaultVal);
    }

    /**
     * Encrypted and set field/value entry into the main data json
     *
     * @param field
     * @param value
     * @return old Value
     */
    setEncrypted(field:string, value:any): any {
        return this.setEncryptedField(PROP_MAIN_DATA, field, value);
    }

    /**
     * Decrypte and return encrypted value of the field defined in the main data json
     *
     * @param field
     * @param defaultVal
     * @return value
     */
    getEncrypted(field:string, defaultVal?:any): any {
        return this.getEncryptedField(PROP_MAIN_DATA, field, defaultVal);
    }

    /**
     * clear/remove a field.
     *
     * @param field
     * @return true if field removed, false if field
     * never exists
     */
    clear(field:string): boolean {
        return this.clearObjectField(PROP_MAIN_DATA, field);
    }

    // Object-in-cache status (not implemented at this level)

    /**
     * Mark this object's data as modified.
     * Implementation is done by subclass
     * JSObject. At this level it's abstract and no-op
     * unless it is contained in which case we'll
     * check with parent.
     *
     * @return {boolean} true if parent object is marked as dirty,
     * or null if no parent.
     */

    setDirty(): boolean {
        // Overrriden in JSObject
        const parentObj:JSObject = this.getJSParent(null);
        // @ts-ignore
        return parentObj ? parentObj.setDirty() : null;
    }

    /**
     * Return whether this object's data is marked as
     * dirty (or modified). Implementation is done
     * by subclass JSObject. At this level it's
     * abstract and no-op.
     *
     * @return true if it's marked as dirty
     */
    isDirty(): boolean {
        const parentObj = this.getJSParent(null);
        // @ts-ignore
        return parentObj ? parentObj.isDirty() : null;
        // Overridden in JSObject
    }

    /**
     * Return whether this object's data is marked
     * either as dirty or new.
     *
     * @return true if it's marked as new or dirty
     */
    isModified(): boolean {
        // implemented by subclass
        return this.isDirty();
    }

    /**
     * Clear modified falg. Not used
     */
    clearModified(): boolean {
        return false;
    }

    /**
     * Clear dirty flag if tracking is enabled. This
     * is for subclass (JSObject-level) implementation.
     * At this level it's abstract (no-op) but we go
     * to parent if this is contained.
     *
     * @return true if has parent and cleared.
     * Null if no-op
     */
    clearDirty(): boolean {
        const parentObj = this.getJSParent(null);
        return parentObj ? parentObj.clearDirty() : false;
    }

    // ---------------- Creation / update / publish timestaps -------------

    /**
     * Set creation date. If null timestamp is given, will
     * assume current time.
     *
     * @param ts epoch time or null
     * @return false if not set
     */
    setCreatedTS(ts:number): boolean {
        if (ts) {
            return JSObject.SetCreatedTS(this.getData(true), ts);
        }
        return false;
    }

    /**
     * Used by StorageManager. Indicate this class of objects
     * must have a creation timestamp. This is to be overridden
     * by subclass
     *
     * @return true to enforce a creation timestamp.
     *
     * @see JSObject#mustHaveUpdatedTS()
     */
    mustHaveCreatedTS():boolean {
        return true;
    }

    /**
     * Return the created timestamp value.
     *
     * @param defaultVal (-1)
     * @return timestamp if exists, defaultVal if not
     *
     * @see JSObject#getUpdatedTS
     * @see JSObject#getTS
     */
    getCreatedTS(defaultVal:any=null) {
        const data = this.getData(false);
        return data ? JSObject.GetCreatedTS(data, defaultVal) : defaultVal;
    }

    /**
     *
     * @returns
     */
    _clearCreatedTS() {
        const retVal = JSObject.ClearCreatedTS(this.getData());
        if (this.isDirty() === false) {
            this.setDirty();
        }
        return retVal;
    }

    /**
     * Used by StorageManager. Indicate this class of objects
     * must have an updated timestamp. This is to be overridden
     * by subclass
     *
     * @return true to enforce a updated timestamp.
     *
     * @see JSObject#mustHaveCreatedTS()
     */
    mustHaveUpdatedTS(): boolean {
        return true;
    }

    /**
     * Get updated timestamp value stored in json. If you want
     * to fetch created timestamp as a fallback, use getTS()
     * instead
     *
     * @param defaultVal
     *
     * @see JSObject#getTS
     */
    getUpdatedTS(defaultVal = -1) {
        const data = this.getData(false);
        return data ? JSObject.GetUpdatedTS(data, defaultVal) : defaultVal;
    }

    _clearUpdatedTS() {
        const retVal = JSObject.ClearUpdatedTS(this.getData());
        if (this.isDirty() === false) {
            this.setDirty();
        }
        return retVal;
    }

    /**
     * Get either the updated timestamp, or created timestamp if
     * no updated timestamp
     *
     * @param defaultVal (-1)
     * @return either updatedTS or createdTS or defaultVal
     *wrapped
     * @see JSObject#getUpdatedTS
     * @see JSObject#getCreatedTS
     */
    getTS(defaultVal:number=-1):number {
        const data = this.getData(false);
        return data ? JSObject.GetTS(data, defaultVal) : defaultVal;
    }


    // ---------------------- Utilities -------------------------

    /**
     * Return content of the data model in property MAIN_DATA as
     * JSON object. The output can be controlled via properties
     * to include or exclude.
     *
     * @param inclProps list of properties to include. Null to include all.
     * @param exclProps list of properties to exclude. Null to exclude none.
     * @param defaultVal
     * @returns JSON object
     *
     * @see JSObject#toJSONString
     * @see JSONUtil#ExportObjectFields
     */
    toJSON(inclProps?:string[], exclProps?:string[], defaultVal:any=null): object {
        const data = this.getData(false);
        if (!data) {
            return defaultVal;
        }
        if (!inclProps && !exclProps) {
            return data;
        }
        return JSONUtil.ExportObjectFields(data, inclProps, exclProps, defaultVal);
    } // toJSON

    /**
     * Print JSON content of the "data" to string.
     *
     * @param replacer see JSON.stringify's replacer parameter
     * @param space see JSON.stringify' space parameter. Default to indent=2
     */
    toString(replacer?:string, space?:string): string {
        const prefix = `[${this.getClassname()}]:`;
        // @ts-ignore
        return prefix + JSON.stringify(this, replacer, space);
    }

    /**
     * Output content data to a JSON as a string type, with options
     * to include and exclude certain properties.
     *
     * @param inclProps list of properties to include. Null to include all.
     * @param exclProps list of properties to exclude. Null to exclude none.
     * @param defaultVal
     * @returns JSON as a string
     *
     * @see JSObjecttoJSON
     * @see JSONUtil#ExportObjectFields
     */
    toJSONString(inclProps?:string[], exclProps?:string[], defaultVal:any=null): string {
        const jsonObj = this.toJSON(inclProps, exclProps, defaultVal);
        return jsonObj ? JSON.stringify(jsonObj) : defaultVal;
    }



  // ------------------------- SERIALIZATION --------------------------

  /**
   * Determine if the given object was put together by the ~Serialize
   * function. The method of checking is there exist an "stype" property,
   * and data is not null.
   *
   * @param jsonObj
   * @returns
   */
  static IsSerializedJSObject(jsonObj:object): boolean {
    // @ts-ignore
    return ((DataUtil.NotNull(jsonObj[PROP_SERIAL_TYPE])) && (DataUtil.NotNull(jsonObj[PROP_MAIN_DATA])));
  }

  /**
   * Convert XObject instance to a format where we can transmit and
   * "re-assemble" on the other side. While we can just convert the
   * entire XObject property "data" to JSON, but there are many transient
   * values that can be attached, so we must only pick those that are
   * relevant. For now, that's the auxillary carrier (AUX_DATA).
   *
   * @param jsobject either XObject instance, json version of it, or any data type
   * @return result structure if it's XObject variant.
   *
   * If not, then result is same as input "data"
   *
   * @see JSObject#DeSerialize
   */
  static Serialize(jsobject:JSObject): {} {
    const jsonObj = JSObject.Unwrap(jsobject);
    const jstype = JSObject.GetType(jsonObj);
    if (jstype == null) {
        return jsobject;
    }
    const result = {};

    // @ts-ignore
    result[PROP_MAIN_DATA] = JSObject.GetData(jsobject);
    // @ts-ignore
    result[PROP_AUX_DATA] = JSObject.GetAuxData(jsobject);
    // @ts-ignore
    result[PROP_SERIAL_TYPE] = jstype;

    return result;
  } // SerializeXObject

  /**
   * Take serialized JSObject content and re-construct
   * the JSObject instance with other carrier data.
   *
   * @param serialized
   * @return a newly constructed instance with data, or
   * same as input if not an object
   *
    * @see JSObject#Serialize
   */
  static DeSerialize(serialized:any): JSObject {
    if (typeof serialized !== 'object') {
        return serialized;
    }

    const jstype = serialized[PROP_SERIAL_TYPE];
    const mainData = serialized[PROP_MAIN_DATA];
    const auxData = serialized[PROP_AUX_DATA];

    if ((jstype == null) || (mainData == null)) {
      // no marking of a serialized set, but can
      // still be wrapped
      return JSObject.Wrap(serialized);
    }
    const jsobj:JSObject = JSObject.Wrap(mainData);
    if (jsobj && auxData) {
        jsobj.setAuxData(auxData);
    }
    return jsobj;
  } // DeSerializeXObject


  /**
   * ***************************************************
   *
   * Static Methods
   *
   * ***************************************************
  */

    /**
     * Required by the JSObject package
     *
     * @returns
     */
    static GetClass(): JSClass {
        return JSObject;
    }

    /**
     * Determine and return this class' name.
     * The static GetClass() method should
     * be implemented by subclasses to return
     * the proper Javascript class object. But
     * developer can override it with a module-level
     * constant _CLSNAME_.
     *
     * @returns class name as defined by _CLSNAME_
     * or property 'name' returned from the static
     * method GetClass()
     *
     * @see #GetClass()
     */
    static GetClassName(): string {
        var _className:string = this.GetClass().name;

        // THINK: should we try  to pre-pend with class paths
        // or some prefix?

        return _className;
    }

    /**
     * Return this class's type ID. This can be
     * different than classname (garbled), and
     * should be overridden by subclass
     *
     * @return
     */
    static GetTypeID(): string {
        let _classname = this.GetClassName();

        var _derivedTypeId = 't_' + _classname.toLowerCase();

        // any special processing of the classname?
        return _derivedTypeId;
    }



    /**
     * This is no-op, but calling it ensures JVM or infrastructure
     * packages will recognize this class (no on-demand load).
     *
     * @returns
     */
    static TrackClass(): boolean {
        return true;
    }

    /**
     * Subclasses register themselves
     *
     * @param typeID optional type string that can be used for
     * reverse lookup (from type string). This can be specified
     * within the JSON version itself under PROP_TYPE
     *
     * @returns true if registration is successful, which means
     * the subclass has a "static GetClass()" declaration.
     *
     * @see #PROP_TYPE
     */
    static RegisterSelf(typeID?:string): boolean {
        var thisClassObj = this.GetClass();
        if (typeID == null) {
            typeID = this.GetTypeID();
        }
        return MetaUtil.RegisterType(thisClassObj, typeID);

    }



    /**
     * Convenient method to check if the given object
     * is an instance of this class (JSObject)
     *
     * @param obj instance of JSObject
     * @return
     */
    static IsInstance(obj:object): boolean {
        return obj instanceof JSObject;
    }

    /**
     * Given an instance of JSObject or just json record,
     * return only the json portion.
     *
     * @param obj either an instance of JSObjec/subclass,
     * or json data itself.
     * @return
     *
     * @see #Wrap
     */
    static Unwrap(obj:(JSObject|object)): JSData {
        if (obj == null) {
            return obj;
        }
        return (obj instanceof JSObject) ? obj.getData() : obj;
    } // Unwrap

    /**
     *
     * @param jsonData
     * @param ClsType
     * @returns
     */
    static Wrap(jsonData:JSData, ClsType?:JSClass): JSObject {
        return JSObject.WrapJSObject(jsonData, ClsType);
    }

    /**
     * Wrap the given json object with an instance of
     * JSObject subclass as specified by the given
     * class type (class constructor)
     *
     * @param jsonData
     * @param ClassObject class constructor function.
     * If you are not sure, use Wrap static function to lookup
     * registry.
     * @return
     *
     * @see #Wrap
     */
    static WrapJSObject(jsonData:JSData, ClassObject?:JSClass): JSObject {
        const _m = 'WrapJSObject';

        // Type checking: to avoid wrapping the wrong type!
        let typeID = jsonData[PROP_TYPE] as JSType;
        if ((typeID == null) && ClassObject == null) {
            const errmsg = 'Missing embedded type and no class specified: ' + String(jsonData);
            _logger.trace(_m, errmsg);
            throw new JSError('JS_WRAP', errmsg);
        }

        // WARNING: this works in Javascript as Class object can be used by "new" operator,
        // but TypeScript is treating Class as a Function
        // @ts-ignore
        let item;

        if (ClassObject == null) {
            // lookup global registration. Should find it if class register itself
            // sometime before this call via JSObject.RegisterSelf()
            ClassObject = MetaUtil.GetClassByType(typeID);
            if (ClassObject == null) {
                const errmsg = `TypeID ${typeID} not registered as a class!`;
                _logger.trace(_m, errmsg);
                throw new JSError('JS_WRAP', errmsg);
            }
        }

        // @ts-ignore
         item = new ClassObject();


        const clsType = item.getType();
        if (typeID && typeID !== clsType) {
            _logger.warn(_m, `Type mismatch: ${typeID} (prop) != ${clsType} (obj)`);
        }
        if (typeID == null) {
            _logger.warn(_m, `Wrapped JSON didn't have type: ${typeID}. Inserting...`);
            jsonData[PROP_TYPE] = clsType;
        }

        // Just in case the object is wrapped via
        // JSObject.toJSON(). This is a HACK as we
        // should rely on the "type" property at the top level.
        if (jsonData && jsonData.hasOwnProperty(PROP_MAIN_DATA)) {
            // @ts-ignore
            item.setData(jsonData[PROP_MAIN_DATA]);
        } else {
            item.setData(jsonData);
        }
        return item;
    }

    /**
     * Determine if the given object is already wrapped,
     * which mean an instance of JSObject
     *
     * @param obj
     */
    static IsWrapped(obj:any): boolean {
        return obj instanceof JSObject;
    }

    /**
     * Wrap the given json data assuming it's a contained json
     * of a parent object. So parent object will be tracked.
     *
     * @param jsonData
     * @param parentObj
     * @param clsType
     */
    static WrapAsChild(jsonData:JSData, parentObj:JSObject, clsType:JSClass): (JSObject | null) {
        const jsobject = JSObject.Wrap(jsonData, clsType);
        if (jsobject && parentObj) {
            jsobject.setJSParent(parentObj);
        }
        return jsobject;
    }

    /**
     * Wrap an array of json data objects
     *
     * @param jsonArray
     * @param clsType
     * @return array of wrapped objects
     */
    static WrapArray(jsonArray:JSData[], clsType:JSClass = JSObject): JSObject[] {
        let result: JSObject[];
        if (jsonArray) {
            // @ts-ignore
            result = jsonArray.map((json:JSData) => {
                const jsobj = JSObject.Wrap(json, clsType);
                return jsobj;
            });
        }
        else {
            result = [];
        }
        return result;
    }

    /**
     * Derive an unique ID based on object type, ownerID,
     * and also randomized but shortended value. The output
     * format is something like:
     *
     * <code>{type}_{ownerId}_{randomNum}</code>
     *
     * @param typeId
     * @param ownerId optional owner ID to include
     * @return derived ID
     */
    static DeriveID(typeId:string, ownerId:string): string {
        const seqNum = Util.GenRandom(Date.now()).toLowerCase();
        let id;
        if (ownerId) {
            id = `${ownerId}_${seqNum}`;
        } else {
            id = seqNum;
        }
        return id;
    } // DeriveID

    /**
     * Simple utility method to create a new instance
     * and initially set an unique identifier and
     * optionally wrap a json object.
     *
     * @param id
     * @param type since JSObject has no type,
     * this is important to specify (no guarantee it'll
     * work completely)
     * @param jsonData
     */
    static CreateNew(id:string, jsonData:JSData): JSObject {
        const newObj = new JSObject();

        if (id) {
            newObj._setId(id);
        }
        if (jsonData) {
            newObj.setData(jsonData);
        }

        return newObj;
    }

    /**
     * Return the json data wrapped by the JSObject instance,
     * if it is wrapped. If not, then return as-is
     *
     * @param jsobject instance of JSObject or unwrapped json
     * @param defaultVal default value if null
     * @return json data if wrapped, or as-is. If
     * null, return defaultVal
     */
    static GetData(jsobject:JSObject, defaultVal:any = null): JSData {
        const jsonObj = JSObject.Unwrap(jsobject);
        const mainData = jsonObj;
        return mainData || defaultVal;
    } // GetData

    /**
     * Return the aux json data wrapped by the JSObject instance
     *
     * @param jsobject instance of JSObject. This cannot be unwraped
     * @param defaultVal
     * @return json aux data or null
     */
    static GetAuxData(jsobject:JSObject, defaultVal:any = null): JSData {
        const auxData = jsobject[PROP_AUX_DATA];
        return auxData || defaultVal;
    }

    /**
     * Clone json data. This will also santize the
     * cloned data including removing timestamp, etc.
     *
     * @param jsonObj JSObject instance to
     * @return
     */
    static CloneData(jsonObj:JSData): JSData {
        return JSON.parse(JSON.stringify(jsonObj));
    }

    /**
     * Clone entire instance of JSObject
     *
     * @param psobject JSObject instance to clone
     * @param cloneData true to perform deep copy (Chrome use reference)
     * @param cloneAux true to perform deep copy on aux data
     * @return new instance of same type
     */
    static CloneInstance(psobject:JSObject, cloneData:boolean = true, cloneAux:boolean = false): JSObject {
        // clone class info, but it's shallow copy
        const newXobj = JSONUtil.CloneInstance(psobject) as JSObject;

        if (cloneData) {
            // Deep clone JSON data
            const jsonData = JSObject.GetData(psobject, null);
            if (jsonData) {
                newXobj.setData(JSONUtil.CloneObject(jsonData));
            } // not efficient
        }
        if (cloneAux) {
            // Deep clone AUX data, if any
            const auxData = JSObject.GetAuxData(psobject, null);
            if (auxData) {
                newXobj.setAuxData(JSONUtil.CloneObject(auxData));
            }
        }
        return newXobj;
    } // CloneInstance


    /**
     * Set the object's unique identifier. This identifier
     * will need to be string (or convertable) and
     * will become lowercased.
     *
     * @param jsonObj
     * @param id string ID
     *
     * @see #GetId
     */
    static SetId(jsonObj:JSData, id:string): boolean {
        jsonObj = JSObject.Unwrap(jsonObj);
        if (jsonObj == null) {
            return false;
        }
        jsonObj[PROP_ID] = String(id).toLowerCase();
        return true;
    }

    /**
     *
     * @param jsonObj
     * @param name
     * @returns true if set, false if can't set
     */
    static SetName(jsonObj:JSData, name:string): boolean {
        jsonObj = JSObject.Unwrap(jsonObj);
        if (jsonObj == null) {
            return false;
        }
        jsonObj[PROP_NAME] = String(name);
        return true;
    }

    /**
     *
     * @param jsonObj
     * @param defaultVal
     * @returns
     */
    static GetName(jsonObj:JSData, defaultVal:any = null): string {
        jsonObj = JSObject.Unwrap(jsonObj);
        const value = jsonObj ? jsonObj[PROP_NAME] : null;
        return (value != null) ? value : defaultVal;
    }

    /**
     * Clear Id field.
     *
     * @param jsonObj
     * @return
     */
    static ClearId(jsonObj:JSData): any {
        const prevId = jsonObj[PROP_ID];
        delete jsonObj[PROP_ID]; // remote all together
        return prevId;
    }

    /**
     * Retreive the value of the property PROP_ID ("_id")
     *
     * @param psobject
     * @param defaultVal
     * @return
     */
    static GetId(psobject:JSObject, defaultVal:any = null): string {
        return psobject ? JSObject.Unwrap(psobject)[PROP_ID] : defaultVal;
    }

    /**
     * Return object's type.
     *
     * @param obj data to check and determine. It must be an
     * object with property "type".
     *
     * @param defaultVal value to return if given data is not
     * a valid JSObject or its json, or missing "type" field.
     */
    static GetType(obj:(JSObject|JSData), defaultVal:any = null): string {
        if ((obj == null) || (typeof (obj) !== 'object')) {
            return defaultVal;
        }

        if (obj instanceof JSObject) {
            // @ts-ignore
            return obj.getType();
        }

        const value = obj[PROP_TYPE];
        return value || defaultVal;
    }

    /**
     * Set creation date. If no date/time is given, will
     * assume current time.
     *
     * @param jsonObj
     * @param date
     * @return true if set, false if can't se
     */
    static SetCreatedTS(jsonObj:JSData, ts:(number | null) = null): boolean {
        if (jsonObj == null) {
            return false;
        }
        jsonObj[PROP_CREATED_DATE] = ts || Date.now();
        return true;
    }

    /**
     *
     * @param jsonObj
     * @return {boolean} true if field removed, false if field does not exist
     */
    static ClearCreatedTS(jsonObj:JSData): boolean {
        if (jsonObj[PROP_CREATED_DATE]) {
            delete jsonObj[PROP_CREATED_DATE];
            return true;
        }
        return false;
    }

    /**
     * Return value in the created timestamp property.
     *
     * @param jsonObj
     * @param defaultVal if none, use this value.
     * @return
     */
    static GetCreatedTS(jsonObj:JSData, defaultVal:any = -1): any {
        const ts = (jsonObj) ? jsonObj[PROP_CREATED_DATE] : null;
        return ts || defaultVal;
    }


  /**
   * Update given json object's timestamp to a given value or now
   *
   * @param jsonObj
   * @param timeVal optional time value to set or null to use current time
   * @return
   */
  static SetUpdatedTS(jsonObj:JSData, timeVal:any = null): (number | null) {
    let prevValue = jsonObj[PROP_UPDATED_DATE];
    jsonObj[PROP_UPDATED_DATE] = (timeVal || Date.now());
    // @ts-ignore
    return prevValue;
  }

  static ClearUpdatedTS(jsonObj:JSData) {
    if (jsonObj[PROP_UPDATED_DATE]) { delete jsonObj[PROP_UPDATED_DATE]; }
  }

  /**
   * Return the value to the field UPDATED_DATE ("udate").
   *
   * @param jsonObj
   * @param defaultVal
   * @return
   */
  static GetUpdatedTS(jsonObj:JSData, defaultVal:number= -1): number {
    const ts = jsonObj ? jsonObj[PROP_UPDATED_DATE] : null;
    return ts || defaultVal;
  }

  /**
   * Get either the updated timestamp, or created timestamp if
   * no updated timestamp
   *
   * @param jsonObj unwrapped XObject instance (wrapped ok too)
   * @param defaultVal (-1)
   * @return either updatedTS or createdTS or defaultVal
   *
   * @see ~GetUpdatedTS
   * @see ~GetCreatedTS
   */
  static GetTS(jsonObj:JSData, defaultVal:any = -1): number {
    jsonObj = JSObject.Unwrap(jsonObj);  // just in case
    let ts = JSObject.GetUpdatedTS(jsonObj, -1);
    if (ts === -1) {
      ts = JSObject.GetCreatedTS(jsonObj, -1);
    }
    return (ts === -1) ? defaultVal : ts;
  }



    // --------------------- Getter/Setter for properties ---------------

    /**
     * Set the value of the field within the given object. The field can be anything
     * from atomic value (string, number) to array or another object as long as its
     * a JSON data structure.
     * The object can be the data wrapped by an instance of JSObject or subclass,
     * but it can also be an embedded json object also.
     *
     * NOTE: the value is set only if two values are not identical
     * They could be equivalent in which case we'll still update.
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field
     * @param value value to set. It can be json or JSObject wrapper
     * @return previous value, or null if value already same and not changed
     * @see ~GetObjectField
     * @see ~SetJSObjectField
     */
    static SetObjectField(jsonObj:JSData, field:string, value:any): any {
        if (!DataUtil.AssertArrayNoNulls([jsonObj, field], _CLSNAME_, 'SetObjFld', 'json,fld')) {
            return null;
        }
        jsonObj = JSObject.Unwrap(jsonObj);
        value = JSObject.Unwrap(value);
        const hasProp = jsonObj.hasOwnProperty(field);
        // @ts-ignore
        const prev = hasProp ? jsonObj[field] : null;
        if (!hasProp || (prev !== value)) {
            // @ts-ignore
            jsonObj[field] = value;
            return prev;
        }
        return null;
    } // SetObjectField

    /**
     * Set the object field that has an JSObject wrapper
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field
     * @param xmValue
     *
     * @see ~SetObjectField
     * @see ~ImportObjectFields
     */
    static SetJSObjectField(jsonObj:JSData, field:string, xValue:any): any {
        return JSObject.SetObjectField(jsonObj, field, xValue);
    } // SetJSObjectField

    /**
     * Import additional property values
     *
     * @param jsonObj
     * @param props
     * @param override true to override existing value
     * @return replaced label/values
     */
    static ImportObjectFields(jsonObj:JSData, props:{}, override:boolean = false): {} {
        props = JSObject.Unwrap(props); // just in case it's from another JSObject
        return JSONUtil.ImportObjectFields(jsonObj, props, override);
    }

    /**
     * Retrieve the value of the field within the given object. The object can
     * be the data wrapped by an instance of JSObject or subclass, but it
     * can also be an embedded json object also.
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field
     * @param defaultVal
     *
     * @see ~GetJSObjectField
     * @see #SetObjectField
     * @see #HasObjectField
     * @see #ClearObjectField
     */
    static GetObjectField(jsonObj:JSData, field:string, defaultVal?:any): any {
        if (!DataUtil.AssertArrayNoNulls([jsonObj, field], _CLSNAME_, 'GetObjectField', 'Field name cannot be null.')) {
            return defaultVal;
        }
        jsonObj = JSObject.Unwrap(jsonObj);
        // @ts-ignore
        const val = jsonObj[field];
        return DataUtil.NotNull(val) ? val : defaultVal;
    }

    /**
     * Retrieve value of a field and wrap it if it is a registered subclass of JSObject
     *
     * @param JSObject instance of JSObject or already unwrapped json data
     * @param field
     * @param defaultVal
     * @return value from the field, which if it's an instance of
     * JSObject, then it will be wrapped accordingly
     */
    static GetJSObjectField(jsobject:(JSObject|JSData), field:string, defaultVal:any = null): any {
        let jsonObj: JSData;
        if (jsobject instanceof JSObject) {
            jsonObj = JSObject.Unwrap(jsobject);
        }
        else {
            jsonObj = jsobject;
        }
        let value = JSObject.GetObjectField(jsonObj, field, null);
        if (DataUtil.IsNull(value)) {
            return defaultVal;
        }

        // Because this is expected to be an JSObject instance, it might
        // be serialized to keep AUX_DATA.
        value = JSObject.DeSerialize(value);

        return DataUtil.NotNull(value) ? value : defaultVal;
    }

    /**
     * Given an object with properties, extract a subset
     * using the inclusion and exclusion field name list.
     *
     * @param jsonObj object to extract properties from
     * @param inFields array of property names to include
     * @param exFields array of property names to exclude.
     * If property name is found in both include and exclude list,
     * the exclusion will win.
     * @return new json object with subset of properties
     */
    static GetObjectFields(jsonObj:JSData, inFields:(string[]|null) = null, exFields:(string[]|null) = null): {} {
        return JSONUtil.ExportObjectFields(jsonObj, inFields, exFields);
    } // GetObjectFields

    /**
     * Given an JSObject instance, extract a subset
     * using the inclusion and exclusion field name list.
     *
     * @param jsonObj object to extract properties from
     * @param inFields array of property names to include
     * @param excFields array of property names to exclude.
     * If property name is found in both include and exclude list,
     * the exclusion will win.
     * @return new json object with subset of properties
     */
    static GetJSObjectFields(jsobject:JSObject, inFields:(string[]|null) = null, exFields:(string[]|null) = null): {} {
        const jsonObj = JSObject.Unwrap(jsobject);
        return JSONUtil.ExportObjectFields(jsonObj, inFields, exFields);
    }

    /**
     * Check if the given field name exists in the given json object.
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field property label to find
     * @param existOK if true, check stops at property exists.
     * if false, then the value associated with propety will be checked for not null or undefined
     * @return true if field (property/key) exists within the given object,
     * unless existOK is set to false for which the actual value is checked.
     *
     * @see #GetObjectField
     * @see #SetObjectField
     * @see #ClearObjectField
     */
    static HasObjectField(jsonObj:JSData, field:string, existOK:boolean = true): boolean {
        jsonObj = JSObject.Unwrap(jsonObj);
        // simple json label check for now.
        const hasProp = jsonObj.hasOwnProperty(field);
        if (!hasProp || (existOK === true)) {
            return hasProp;
        }
        // @ts-ignore check actual value
        return DataUtil.NotNull(jsonObj[field]);
    }

    /**
     * Clear the property entry of the given object.
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field property label to find and delete
     *
     * @see #GetObjectField
     * @see #SetObjectField
     * @see #HasObjectField
     * @return true if cleared
     */
    static ClearObjectField(jsonObj:JSData, field:string) {
        jsonObj = JSObject.Unwrap(jsonObj);
        if (jsonObj.hasOwnProperty(field)) {
            // @ts-ignore
            delete jsonObj[field];
            return true;
        }
        return false;
    } // ClearObjectField

    // --------------------------- Base64 Fields ---------------------

    /**
     * Set the value as a base64 encoded string to the field inside the given object.
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field
     * @param value value to set. It can be json or JSObject wrapper
     * @return previous value, or null if value already same and not changed
     * @see ~GetObjectField
     * @see ~SetJSObjectField
     */
    static SetBase64Field(jsonObj:JSData, field:string, value:any) {
        if (!DataUtil.AssertNotNull(field, _CLSNAME_, 'SetBase64Field', 'Field name cannot be null.')) {
            return null;
        }
        jsonObj = JSObject.Unwrap(jsonObj);
        value = JSObject.Unwrap(value);
        const b64val = Base64.encode(value);
        // @ts-ignore
        const prev = jsonObj.hasOwnProperty(field) ? jsonObj[field] : null;
        if (prev !== b64val) {
            // @ts-ignore
            jsonObj[field] = b64val;
            return prev;
        }
        return null;
    } // SetObjectField

    /**
     * Retrieve the base64 encoded value of the field and decode it.
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field
     * @param defaultVal
     *
     * @see ~GetJSObjectField
     * @see #SetObjectField
     * @see #HasObjectField
     * @see #ClearObjectField
     */
    static GetBase64Field(jsonObj:JSData, field:string, defaultVal:any = null): any {
        if (!DataUtil.AssertArrayNoNulls([jsonObj, field], _CLSNAME_, 'GetBase64Field', 'Field name cannot be null.')) {
            return defaultVal;
        }
        jsonObj = JSObject.Unwrap(jsonObj);
        // @ts-ignore
        const b64val = jsonObj[field];
        const val = (DataUtil.NotNull(b64val)) ? Base64.decode(b64val) : null;
        return DataUtil.NotNull(val) ? val : defaultVal;
    }

    // ----------------------- Encrypted Fields ------------------------

    /**
     * Encrypt and the value as a string to the field inside the given object.
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field
     * @param value value to set. It can be json or JSObject wrapper
     * @return previous value, or null if value already same and not changed
     * @see ~GetObjectField
     * @see ~SetJSObjectField
     */
    static SetEncryptedField(jsonObj: JSData, field:string, value:any): any {
        if (!DataUtil.AssertNotNull(field, _CLSNAME_, 'SetEncField', 'Field name cannot be null.')) {
            return null;
        }
        jsonObj = JSObject.Unwrap(jsonObj);
        value = JSObject.Unwrap(value);
        const encval = JSONUtil.EncryptJSON(value);
        // @ts-ignore
        const prev = jsonObj.hasOwnProperty(field) ? jsonObj[field] : null;
        if (prev !== encval) {
            // @ts-ignore
            jsonObj[field] = encval;
            return prev;
        }
        return null;
    } // SetEncryptedField

    /**
     * Retrieve the encrypted value of the field and decrypt it before returning
     *
     * @param jsonObj instance of JSObject or already unwrapped json data
     * @param field
     * @param defaultVal
     * @returns value
     *
     * @see #GetJSObjectField
     * @see #SetEncryptedField
     * @see #HasObjectField
     * @see #ClearObjectField
     */
    static GetEncryptedField(jsonObj: JSData, field:string, defaultVal:any = null): any {
        if (!DataUtil.AssertArrayNoNulls([jsonObj, field], _CLSNAME_, 'GetEncField', 'Field name cannot be null.')) {
            return defaultVal;
        }
        jsonObj = JSObject.Unwrap(jsonObj);

        // @ts-ignore
        const encval = jsonObj[field];
        const val = (DataUtil.NotNull(encval)) ? JSONUtil.DecryptJSON(encval) : null;
        return DataUtil.NotNull(val) ? val : defaultVal;
    } // GetEncryptedField


} // class JSObject

JSObject.RegisterSelf();

export default JSObject;
