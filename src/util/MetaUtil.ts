import Logger from "../system/Logger";
import { JSClass, JSType } from "../model/JSTypes";

const _CLSNAME_ = 'MetaUtil';
const _logger = Logger.Get(_CLSNAME_);

export class MetaUtil {

  /**
   *
   * @param {Function} clsObj
   * @returns {string | null}
   */
  static DetermineClassType(clsObj: Function): string {
    const _m = 'DetermineClassType';
    let type = null;
    if (clsObj == null) {
      _logger.error(_m, 'Passed in null class!');
      // @ts-ignore
      return null;
    }

    if (clsObj.hasOwnProperty('GetTypeID')) {
        // @ts-ignore
        type = clsObj.GetTypeID();
    } else if (clsObj.hasOwnProperty('name')) {
        type = clsObj.name;
    } else {
      _logger.trace(_m, `!!!!! given class object is not what it seems! obj:`, clsObj);
    }

    return type;
  } // DetermineClassType

  /**
   * Globall register mapping of a type string to a class (constructor).
   * This is critical to support dynamic instantiation of proper
   * ES6 class wrapper for a given type. All register types should
   * be subclass of XObject (component), or JSObject (first class entity)
   *
   * @param {Function} clsObj class object (constructor?)
   * @param {string | null} type name of the class. If null, then call the class object's
   * GetTypeID() static method if exists
   *
   * @return {boolean} true if registered; false if not (type unknown)
   *
   * @see MetaUtil.GetClassByType
   */
  static RegisterType(clsObj:JSClass, type?:JSType): boolean {
    const _m = 'RegisterType';

    if (type == null) {
      type = MetaUtil.DetermineClassType(clsObj);
    }
    if (type == null) {
      _logger.error(_m, '!!!!! Cannot determine the type for class object: ', clsObj);
      _logger.trace(_m, 'dump');
      return false;
    }

    let registered = false;

    // We use a model dictionary within 'global' to track the mapping lazily
    // @ts-ignore
    if (global.model == null) { global.model = {}; }

    // @ts-ignore
    if (global.model.hasOwnProperty(type)) {
      // Shoudn't happen since we are checking for class object's own property (not inherited)
      // @ts-ignore
    _logger.debug(_m, `Type: ${type} already registerd to class constructor: ${global.model[type]}`, { _m });
    } else {
      // @ts-ignore
      global.model[type] = clsObj;
      // let clsname = ObjectBase.GetClassNameOf(clsObj);
    }
    return registered;
  } // RegisterType

  /**
   *
   * @param typeID
   * @returns
   */
  static DeregisterType(typeID:JSType): boolean {
    const _m = 'DeregisterType';
    if (typeID == null) {
      _logger.error(_m, 'Null type');
      return false;
    }
    // @ts-ignore
    if (global.model == null || !global.model.hasOwnProperty(typeID)) { return null; }
    // @ts-ignore
    delete global.model[typeID];
    // @ts-ignore
    return (global.model[typeID] == null);
  }

  /**
   * Utility to get the name of the class,
   * which should either have a static method
   * "GetName", or if instance of XObject, would
   * have an attribute "classname" as needed for log.
   *
   * @param ClsObj class type
   * @returns
   */
  static GetClassNameOf(ClsObj:JSClass, defaultVal:JSType = 'Unknown'): string {
    let name;
    if (ClsObj.hasOwnProperty('GetName')) {
    // @ts-ignore
    name = ClsObj.GetName();
    } else {
      // @ts-ignore

      const inst = new ClsObj();
      if (inst.hasOwnProperty('classname')) { name = inst.classname; }
    }
    return name || defaultVal;
  }

  /**
   * Lookup type-class map to return the class object (constructor)
   *
   * @param {string} typeID previously registered type
   * @return {Function | null} class constructor
   *
   * @see MetaUtil.RegisterType
   * @see MetaUtil.DeregisterType
   * @see JSObject.Wrap
   */
  static GetClassByType(typeID:JSType): JSClass {
    const _m = 'GetClassByType';
    if (typeID == null) {
      _logger.error(_m, 'Null type');
      // @ts-ignore
      return null;
    }

    // @ts-ignore
    if (global.model == null || !global.model.hasOwnProperty(typeID)) { return null; }

    // @ts-ignore
    return global.model[typeID];
  }

}

export default MetaUtil;
