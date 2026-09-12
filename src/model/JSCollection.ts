
import DataUtil from '../util/DataUtil';
import JSObject, { JSData } from './JSObject';
import JSError from './JSError';
import { JSClass } from '../types';


const _CLSNAME = 'JSCollection'; // match class name
const PROP_LIST = 'list';


/**
 * Model an XMObject that stores a collection
 * of XMObject subclass instances as JSON objects.
 */
export class JSCollection extends JSObject {
  public static PROP_LIST = PROP_LIST;

  constructor(objects?:JSObject[], classObj:JSClass=JSCollection) {
    super(undefined, classObj);

    if (objects) {
      this.setList(objects);
    }
  }

  /**
   * The statics that getClass()-dispatched calls rely on at the collection
   * level. JSCollection defines them all and subclasses may override them.
   */
  private _collectionStatics(): typeof JSCollection {
    return this.getClass() as typeof JSCollection;
  }


  forEach(callbackfn: (value: JSObject, index: number, array: JSObject[]) => void, thisArg?: any): (void | null) {
    const list = this.getWrappedList();
    return list ? list.forEach(callbackfn, thisArg) : null;
  }

  setList(dataArray: any[]): void {
    const jsonData = this.getData(true);
    jsonData[PROP_LIST] = dataArray;
  }

  /**
   * Return the JSON objects in an array as stored.
   * The array is not copied, so any changes to it
   * will be reflected in this object. Each object
   * in the list is NOT wrapped.
   *
   * @param create true to create internal list if doesn't exist
   * @return array or null if no data
   *
   * @see #getWrappedList
   */
  getList(create = false): (JSData[] | null) {
    const dataObj = this.getData(create);
    return dataObj ? this._collectionStatics().GetList(dataObj, create) : null;
  }

  /**
   * Sort content and return the sorted list. The internals of this
   * result list is not changed.
   *
   * @param {string} field1
   * @param {string} field2
   * @param {*} direction
   * @return {Array} sorted Array that replaced content
   */
  getSortedList(field1: string, field2?: string, direction: any = null): any[] {
    throw new JSError('NOT_IMPLEMENTED', 'getSortedList: sorting helper never shipped with this package');
  }

  /**
   * Sort content of this resultlist in-place.
   *
   * @param {string} field1
   * @param {string} field2
   * @param {string} direction
   */
  sortContent(field1: string, field2?: string, direction: any = null): any[] {
    const sortedList = this.getSortedList(field1, field2, direction);
    if (sortedList) { this.setList(sortedList); }
    return sortedList;
  }

  /**
   * Return the array list with keys in an object.
   * Key needs to be a field inside each item object.
   * Default is "_id" but most likely to be "tag_id"
   * for something with tags.
   *
   * @return {string[]} keyed map
   */
  getKeyedList(create = false, field = '_id'): any {
    throw new JSError('NOT_IMPLEMENTED', 'getKeyedList: keyed-map helper never shipped with this package');
  }

  /**
   * Return the item in the list that has the matching
   * value of the given field.
   */
  getItemByID(idValue: any): any {
    return this._collectionStatics().GetItemByID(this.getList(), idValue);
  }

  /**
   * Return the item in the list that has the matching
   * userId with the owner ID field.
   *
   * @param {string} userId user's ID to check
   * @return {XObject} matching object
   *
   * @see ~getItemByID
   * @see ~getItemAt
   */
  getItemByOwnerID(userId: string): any {
    return this._collectionStatics().GetItemByOwnerID(this.getList(), userId);
  }

  /**
   * Return list item at index position
   *
   * @param {number} idx index position of item, from 0 to size() -1
   * @param {*} defaultVal
   */
  getItemAt(idx: number, defaultVal: any = null): any {
    const list = this.getList();
    if (!list || idx < 0 || idx > list.length) { return defaultVal; }
    return list[idx];
  } // getItemAt(idx)

  /**
   *
   * @param {number} idx
   * @param {*} defaultVal
   * @return {XObject}
   */
  getXItemAt(idx: number, defaultVal: any = null, type: any = null): any {
    const data = this.getItemAt(idx, null);
    return (DataUtil.NotNull(data)) ? JSObject.Wrap(data, type ?? undefined) : defaultVal;
  }

  /**
   * Return the index of item in the list that has the matching
   * value of the given field.
   *
   * @param {string} idValue value of the object ID
   */
  getItemIndexByID(idValue: any): any {
    return this._collectionStatics().GetItemIndexByID(this.getList(), idValue);
  }

  /**
   * Return the items in the list that has the matching
   * value of the given field.
   *
   * @param {string} field name of the field to lookup to retreive value to match
   * @param {string} value value to match the field.
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} item index numbers of matched items
   *
   * @see ~getItemByField
   * @see ~getItemsByField
   */
  getItemsIndicesByField(field: string, value: any, max = -1): (number[] | null) {
    const list = this.getList(false);
    return list ? JSCollection.GetItemIndicesByField(list, field, value, max) : null;
  }

  /**
   * Return the item in the list that has the matching
   * value of the given field.
   *
   * @param {string} field property name
   * @param {string} value of the field to match
   * @return {*} matched item
   *
   * @see ~GetItemIndicesByField
   */
  getItemByField(field: string, value: any): any {
    return this._collectionStatics().GetItemByField(this.getList(), field, value);
  }

  /**
   * Return the items in the list that has the matching
   * value of the given field.
   *
   * @param {string} field name of the field to lookup to retreive value to match
   * @param {string} value value to match the field.
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} items that matched the field/value, or null if no match or no data
   *
   * @see ~getXItemsByField
   * @see ~getItemIndicesByField
   * @see ~getItemByField
   */
  getItemsByField(field: string, value: any, max = -1): (any[] | null) {
    return field ? JSCollection.GetItemsByField(this.getList(), field, value, max) : null;
  }


  /**
   * Return the matched items as wrapped XObjects in the list that has the matching
   * value of the given field.
   *
   * @param {string} field name of the field to lookup to retreive value to match
   * @param {string} value value to match the field.
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} items that matched the field/value, or null if no match or no data
   *
   * @see ~getItemsByField
   * @see ~getItemIndicesByField
   * @see ~getItemByField
   */
  getXItemsByField(field: string, value: any, max = -1): (JSObject[] | null) {
    const list = this.getItemsByField(field, value, max);
    return list ? JSCollection.ArrayToWrappedArray(list) : null;
  }

  /**
   * Return the items in the list using the custom external matching function.
   *
   * @param {function} matching function taking arguments (field, lhsValue, rhsValue).
   * @param {string} value value to match the field.
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} items that matched the field/value, or null if no match or no data
   *
   * @see ~getXItemsByField
   */
  getItemsByMatcher(matcher: (item: any) => any, max = -1): (any[] | null) {
    const list = this.getList();
    return list ? JSCollection.GetItemsByMatcher(list, matcher, max) : null;
  }

  /**
   * Return the matched items as wrapped XObjects in the list that has the matching
   * value of the given field.
   *
   * @param {string} field name of the field to lookup to retreive value to match
   * @param {string} value value to match the field.
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} items that matched the field/value, or null if no match or no data
   *
   * @see ~getItemsByMatcher
   */
  getXItemsByMatcher(matcher: (item: any) => any, max = -1): (JSObject[] | null) {
    const list = this.getItemsByMatcher(matcher, max);
    return list ? JSCollection.ArrayToWrappedArray(list) : null;
  }

  /**
   * Return the index position of the item in the array that has
   * the matching value of the given field.
   *
   * @param {string} field property name
   * @param {string} value of the field to match
   * @return {*} matched item
   */
  getItemIndexByField(field: string, value: any): number {
    return this._collectionStatics().GetItemIndexByField(this.getList(), field, value);
  }

  /**
   * Return number of items in the list
   *
   * @return {number} actual count or zero
   *
   * @see ~size
   */
  getItemCount(): number {
    const list = this.getList();
    return list ? list.length : 0;
  }

  /**
   * Return number of items in the list
   *
   * @return {number} actual count or zero
   * @see ~getItemCuont
   */
  size(): number {
    return this.getItemCount();
  }

  /**
   * Remove / trim list
   *
   * @param {number} startIdx start position in the array to remove
   * @param {number} count number of items to remove (default 0)
   * @return {object[]} removed items (not wrapped)
   */
  removeItems(startIdx: number, count = 0): any[] {
    const list = this.getList();
    return list ? list.splice(startIdx, count) : [];
  }

  /**
   * Remove and return the item in the list that has the matching
   * value of the given field.
   *
   * @param {string} idValue
   * @return {*} removed object if matched ID in _id field. Null otherwise.
   */
  removeItemByID(idValue: any): any {
    const retval = this._collectionStatics().RemoveItemByID(this.getList(), idValue);
    if (retval) { this.setDirty(); }
    return retval;
  }

  /**
   * Remove and return the item in the list that has the matching
   * value of the given field.
   *
   * @param {string} field
   * @param {*} value
   * @return {*} removed object if matched. Null otherwise.
   */
  removeItemByField(field: string, value: any): any {
    const retval = this._collectionStatics().RemoveItemByField(this.getList(), field, value);
    if (retval) { this.setDirty(); }
    return retval;
  }

  /**
   * Return a list of internal objects (data.list)
   * that is wrapped with the given function.
   *
   * @param {boolean} create true to create internal list if doesn't exist
   * @param {function} wrapperFunc function that takes each JSON object
   * in list and wrap/convert it
   * @return {[]} array of XMObject instances
   *
   * @see ~setXObjects
   */
  getWrappedList(create = false, wrapperFunc: (json: JSData) => JSObject = JSObject.Wrap): (JSObject[] | null) {
    const jsonItemList = this.getList(create);
    if (jsonItemList == null) { return jsonItemList; }
    return this._collectionStatics().ArrayToWrappedArray(jsonItemList, wrapperFunc);
  }

  isEmpty(): any {
    const jsonObj = this.getData();
    const list = jsonObj || [null];
    return (list as any).length;
  }

  includesItem(jsonItem: any): boolean {
    const list = this.getList(false);
    return list ? list.includes(jsonItem) : false;
  }

  includesXMObject(xmObject: JSObject): boolean {
    return this.includesItem(xmObject.getData());
  }

  includesItemByField(field: string, value: any): boolean {
    return DataUtil.NotNull(this.getItemByField(field, value));
  }

  includesItemByID(idValue: any): any {
    return this.getItemByField('_id', idValue);
  }

  /**
   * Add a json object as an object to the list.
   *
   * @param {{}} jsonItem or a wrapped object
   * @param {number} index position to add. -1 to append at end.
   * @return {boolean} true if added
   *
   * @see ~addXMObject
   */
  addItem(data: any, index = -1): boolean {
    const jsonItem = JSObject.Unwrap(data);
    const list = this.getList(true);
    if (list == null) { return false; }
    if ((index < 0) || (index >= list.length)) { list.push(jsonItem); } else { list.splice(index, 0, jsonItem); }
    this.setDirty();
    return true;
  }

  /**
   * Add a XMObject instance as an item to this list
   *
   * @param {JSObject} xmObject
   *
   * @see ~addItem
   * @see ~addXObjects
   */
  addXObject(xmObject: JSObject): boolean {
    if (xmObject == null) { return false; }
    return this.addItem(xmObject);
  }

  /**
   * Add an array of objects, for which we'll strip the wrapper
   * of each and just add json portion.
   *
   * @param {XObject[]} xmObjects wrapped object but json OK
   * @return {number} number of objects added
   */
  addXItems(xmObjects: any[]): number {
    // xmObjects.forEach(xObject => this.addXObject(xObject));
    const size = xmObjects ? xmObjects.length : 0;
    let added = 0;
    for (let i = 0; i < size; i++) {
      const xobj = xmObjects[i];
      if (xobj) {
        this.addItem(xobj);
        added++;
      }
    }
    return added;
  } // addXObjects

  /**
   *
   * @param {JSObject[]} xmObjects
   *
   * @see ~addXItems
   * @deprecated
   */
  addXObjects(xmObjects: any[]): number {
    return this.addXItems(xmObjects);
  }

  /**
   * Return all items in list but wrapped as XObject instances
   * instead of JSON.
   *
   * @return {XObject[]}
   *
   * @see ~getXItemsByField
   * @see ~getXItemsByMatcher
   */
  getXItems(): (JSObject[] | null) {
    return this.getWrappedList();
  }

  /**
   *
   * @return {XObject[]}
   *
   * @see ~getXItems
   */
  getXObjects(): (JSObject[] | null) {
    return this.getWrappedList();
  }

  getSortedXItems(field: any = null): any {
    throw new JSError('NOT_IMPLEMENTED', 'getSortedXItems: sorting helper never shipped with this package');
  }

  getSortedByCreateTime(): any {
    throw new JSError('NOT_IMPLEMENTED', 'getSortedByCreateTime: sorting helper never shipped with this package');
  }

  /**
   * Return the IDs of all objects in the list.
   *
   * @param {[]} list object list
   * @param {boolean} unique true if don't return duplicates
   * @param {boolean} includeNull true to include null values
   * @return {[]} list of IDs, or null if empty
   */
  getItemIds(unique = true, includeNull = false): (any[] | null) {
    const jsonList = this.getData(false);
    return jsonList ? JSCollection.GetItemIDs(jsonList, unique, includeNull) : null;
  }

  /**
   *
   * Return values to fields of each item in array
   *
   * @param {string=} field property name to match. Null will default to _id
   * @param {boolean} unique true if unique
   * @param {boolean} includeNull true to include null for objects without the field
   * @return {[]=} list of results, or null if null list is passed in
   */
  toFieldValueList(field: (string | null) = null, unique = true, includeNull = false): any[] {
    const jsonList = this.getList(false);
    return jsonList ? JSCollection.ToFieldValueList(jsonList, field, unique, includeNull) : [];
  }

  /**
   * Check if given object is in the list. This is a
   * pass-thru for array data, so wrapped object
   * won't be detect.
   * @param {{}} obj check if object was added.
   *
   */
  includes(obj: any): boolean {
    // Crashes without a list, as it always has: callers own the precondition.
    return this.getList()!.includes(obj);
  }
  indexOf(obj: any): number {
    return this.getList()!.indexOf(obj);
  }
  splice(idx: number, n: number): JSData[] {
    return this.getList()!.splice(idx, n);
  }
  length(): number {
    return this.getList()!.length;
  }

  // *************************************************************
  //
  // Class/static methods. This should also include any
  // methods that can be used as helper for generic
  // JSON data structure should be implemented here
  // and called by instance methods.
  //
  // *************************************************************

  /**
   * Return the default folder/table/collection name used
   * for storing ranked lists.
   */
  static GetFolderName(): string {
    return 'NONE';
  }

  static GetName(): string {
    return _CLSNAME;
  }

  static GetTypeID(): string {
    return _CLSNAME;
  }

  /**
   * Wrap JSON data that represents XMList
   */
  // static Wrap(jsonRec, clsType=XMList) {
  //     return XMList.WrapXMObject(jsonRec, clsType);
  // }

  /**
   * Take an array of JSON objects and wrap with
   * the given wrapper function
   *
   * @return new array list with each item wrapped by
   * the given wrapping function
   */
  static ArrayToWrappedArray(itemList: any[], wrapperFunc: (json: JSData) => JSObject = JSObject.Wrap): JSObject[] {
    const result: JSObject[] = [];
    itemList.forEach((jsonItem) => {
      result.push(wrapperFunc(jsonItem));
    });
    return result;
  }

  // static ToKeyedList(list, field="_id", keyLabel="key") {
  //     let resultList = list.map((item) => {
  //         if (item.hasOwnProperty(keyLabel))
  //             return item;

  //         let keyValue = item[field];
  //         let newItem;
  //         if (Util.NotNull(keyValue)) {
  //             let newFields = {};
  //             newFields[keyLabel] = keyValue;
  //             newItem = Object.assign(item, newFields);
  //         }
  //         else
  //             newItem = Object.assign(item);
  //         return newItem;
  //     });
  //     return resultList;
  // }


  /**
   * Return the JSON objects in an array as stored.
   * The array is not copied, so any changes to it
   * will be reflected in this object. Each object
   * in the list is NOT wrapped.
   *
   * @param jsonData json content that XMList wraps
   * @param create true to create internal list if doesn't exist
   *
   */
  static GetList(jsonData:JSData, create = false): any {
    jsonData = this.Unwrap(jsonData);
    // The list property is owned by this class and always written as an array.
    let list = jsonData[PROP_LIST] as (JSData[] | undefined);
    if ((list == null) && (create === true)) {
      list = [];
      jsonData[PROP_LIST] = list;
    }
    return list;
  }

  /**
   * Return values to fields of each item in array
   *
   * @param list array of objects
   * @param field property name to match. Null for default _id
   * @param unique true if unique
   * @param includeNull true to include null for objects without the field
   * @return list of results, or null if null list is passed in
   */
  static ToFieldValueList(list: any[], field: (string | null) = null, unique = true, includeNull = false): any[] {
    if (field == null) { field = JSObject.PROP_ID; }

    const resultList = [];
    const valueMap: Record<string, boolean> = {};
    const len = (list) ? list.length : 0;
    let item;
    let itemValue;
    for (let i = 0; i < len; i++) {
      item = list[i];
      itemValue = null;
      if (item.hasOwnProperty(field)) { itemValue = item[field]; }
      if (itemValue == null && !includeNull) { continue; }

      if (unique && (DataUtil.NotNull(itemValue))) {
        if (valueMap.hasOwnProperty(itemValue)) { continue; }   // skip
        valueMap[itemValue] = true; // add to tracking
      }

      resultList.push(itemValue);
    }
    return resultList;
  } // ToFieldValueList

  /**
   * Return the IDs of all objects in the list.
   *
   * @param {[]} listObj json XMList
   * @param {boolean} unique true if don't return duplicates
   * @param {boolean} includeNull true to include null values
   */
  static GetItemIDs(listObj: any, unique = true, includeNull = false): (any[] | null) {
    listObj = this.Unwrap(listObj);
    const list = listObj ? listObj[PROP_LIST] : null;
    if (list == null) { return null; }
    return this.ToFieldValueList(list, JSObject.PROP_ID, unique, includeNull);
  }

  /**
   * Return values to fields of each (XObject) item in array
   *
   * @param {[]} list standard array but containing instances of XObject
   * @param {string} field property name to match
   * @param {boolean} unique true if unique
   * @param {boolean} includeNull true to include null for objects without the field
   */
  static ToFieldValueXList(list: any, field: (string | null) = null, unique = true, includeNull = false): (any[] | null) {
    list = JSCollection.Unwrap(list);
    const jsonList = list ? list.map((xitem: any) => JSObject.Unwrap(xitem)) : null;
    return jsonList ? JSCollection.ToFieldValueList(jsonList, field, unique, includeNull) : null;
  }

  /**
   * Return the index position of the item in the
   * given list. The item is matched by specified
   * field and its value.
   *
   * @param standard Javascript list array
   * @param field field name to retreive value to match
   * @param value value to match the field.
   *
   * @return first item that matches, or null if none
   */
  static GetItemIndexByField(list: any, field: string, value: any): number {
    const indices = JSCollection.GetItemIndicesByField(list, field, value, 1);
    return indices ? indices[0] : -1;
  }

  /**
   * Return the index position of the item in the
   * given list. The item is matched by specified
   * field and its value.
   *
   * @param {[]} list standard Javascript list array
   * @param {string} field field name to retreive value to match
   * @param {string} value value to match the field.
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} items that matched, or null if none
   */
  static GetItemIndicesByField(list: any, field: string, value: any, max = -1): (number[] | null) {
    if (list === null || list.length === 0) { return null; }

    const indices = [];
    let item;
    for (let i = 0; i < list.length; i++) {
      item = list[i];
      if (item && item[field] === value) {
        indices.push(i);
        if (max !== -1) {
          --max;
          if (max === 0) { break; }
        }
      }
    }
    return indices.length > 0 ? indices : null;
  } // GetItemIndicesByField

  /**
   * Return the item in the list that has the matching
   * value of the given field.
   *
   * @param {[]} liststandard Javascript list array
   * @param {string} field name of the field to lookup to retreive value to match
   * @param {*} value value to match the field.
   *
   * @return {*} item in the list that matched the field/value
   */
  static GetItemByField(list: any, field: string, value: any): any {
    if (list === null || list.length === 0) { return null; }

    let item;
    for (let i = 0; i < list.length; i++) {
      item = list[i];
      if (item && item[field] === value) { return item; }
    }
    return null;
  }

  /**
   * Return the items in the list that has the matching
   * value of the given field.
   *
   * @param {[]} list standard Javascript list array
   * @param {string} field name of the field to lookup to retreive value to match
   * @param {string} value value to match the field.
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} items that matched the field/value
   */
  static GetItemsByField(list: any, field: string, value: any, max = -1): (any[] | null) {
    if (list === null || list.length === 0) { return null; }

    const result = [];
    let item;
    for (let i = 0; i < list.length; i++) {
      item = list[i];
      if (item && item[field] === value) {
        result.push(item);
        if (max !== -1) {
          --max;
          if (max === 0) { break; }
        }
      } // matched
    } // for all
    return result.length > 0 ? result : null;
  } // GetItemsByField

  /**
   * Return the items in the list that satify
   * the given matcher function: match(fieldname, lhsValue, rhsValue)
   *
   * @param {[]} list standard Javascript list array
   * @param {function} matcher function that takes the item as input
   * @param {number} max maximum match before quiting (-1 for unlimited)
   *
   * @return {[]=} items that matched the field/value
   */
  static GetItemsByMatcher(list: any, matcher: (item: any) => any, max = -1): (any[] | null) {
    if (list === null || list.length === 0) { return null; }

    const result = [];
    let item;
    let verdict;
    for (let i = 0; i < list.length; i++) {
      item = list[i];
      verdict = matcher(item);
      if (verdict) {
        result.push(item);
        if (max !== -1) {
          --max;
          if (max === 0) { break; }
        }
      } // matched
    } // for all
    return result.length > 0 ? result : null;
  } // GetItemsByMatcher

  static GetItemIndexByID(list: any, value: any): (number[] | null) {
    return this.GetItemIndicesByField(list, this.PROP_ID, value, 1);
  }

  /**
   * Find and return an item in the list by the value in the
   * property "_id"
   *
   * @param {XMList} list json/XMList
   * @param {*} value
   */
  static GetItemByID(list: any, value: any): any {
    return this.GetItemByField(list, this.PROP_ID, value);
  }

  /**
   * Return the item that matches the owner's ID
   *
   * @param {XMList} list
   * @param {string} userId
   *
   * @return {XObject} found item
   */
  static GetItemByOwnerID(list: any, userId: string): any {
    // PROP_OWNERID was never declared on this class; kept as-is from the
    // XMList origins, so this matches nothing until a subclass declares it.
    return this.GetItemByField(list, (this as any).PROP_OWNERID, userId);
  }


  /**
   * Remove Return the item in the list that has the matching
   * value of the given field. Note this method only removed
   * the first item with the matching field/value.
   *
   * @param standard Javascript list array
   * @param field field name to retreive value to match
   * @param value value to match the field.
   *
   * @return item removed, or null if can't match field/value
   */
  static RemoveItemByField(list: any, field: string, value: any): any {
    const idx = this.GetItemIndexByField(list, field, value);
    if (idx === -1) { return null; }

    const objectAtIdx = list[idx];
    list.splice(idx, 1);
    return objectAtIdx;
  }

  static RemoveItemByID(list: any, value: any): any {
    return this.RemoveItemByField(list, '_id', value);
  }
} // class XMList

JSCollection.RegisterSelf();

export default JSCollection;
