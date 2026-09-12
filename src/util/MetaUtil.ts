import Logger from "../system/Logger";
import { JSClass, JSType } from "../types";

const _CLSNAME_ = 'MetaUtil';
const _logger = Logger.Get(_CLSNAME_);

/**
 * The registry deliberately lives on `global` rather than in module state:
 * when a dependency tree carries more than one copy of this package, every
 * copy must still see one shared type-to-class map, or deserialization
 * breaks depending on which copy wrapped the data.
 */
type RegistryHost = typeof globalThis & { model?: Record<string, JSClass> };

export class MetaUtil {

  /** The one place the untyped `global` store is reached. */
  private static Registry(): Record<string, JSClass> {
    const host = global as RegistryHost;
    if (host.model == null) { host.model = {}; }
    return host.model;
  }

  /**
   *
   * @param {Function} clsObj
   * @returns the declared or derived type label, or null if undeterminable
   */
  static DetermineClassType(clsObj: JSClass): (string | null) {
    const _m = 'DetermineClassType';
    let type: (string | null) = null;
    if (clsObj == null) {
      _logger.error(_m, 'Passed in null class!');
      return null;
    }

    if (clsObj.hasOwnProperty('GetTypeID') && clsObj.GetTypeID) {
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
  static RegisterType(clsObj:JSClass, type?:(JSType | null)): boolean {
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
    const registry = MetaUtil.Registry();

    if (registry.hasOwnProperty(type)) {
      // Shoudn't happen since we are checking for class object's own property (not inherited)
    _logger.debug(_m, `Type: ${type} already registerd to class constructor: ${registry[type]}`, { _m });
    } else {
      registry[type] = clsObj;
      // let clsname = ObjectBase.GetClassNameOf(clsObj);
    }
    return registered;
  } // RegisterType

  /**
   *
   * @param typeID
   * @returns true if the type is gone from the registry after this call
   */
  static DeregisterType(typeID:JSType): boolean {
    const _m = 'DeregisterType';
    if (typeID == null) {
      _logger.error(_m, 'Null type');
      return false;
    }
    const registry = MetaUtil.Registry();
    if (!registry.hasOwnProperty(typeID)) { return false; }
    delete registry[typeID];
    return (registry[typeID] == null);
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
    if (ClsObj.hasOwnProperty('GetName') && ClsObj.GetName) {
    name = ClsObj.GetName();
    } else {
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
  static GetClassByType(typeID:JSType): (JSClass | null) {
    const _m = 'GetClassByType';
    if (typeID == null) {
      _logger.error(_m, 'Null type');
      return null;
    }

    const registry = MetaUtil.Registry();
    if (!registry.hasOwnProperty(typeID)) { return null; }

    return registry[typeID];
  }

}

export default MetaUtil;
