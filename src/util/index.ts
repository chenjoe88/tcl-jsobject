/**
 * Util: the public surface.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS SUBSYSTEM IS FOR
 * ---------------------------------------------------------------------------
 * Stateless helpers over values and JSON, plus the class registry:
 *
 *   DataUtil    null checks, string/number/boolean coercion, array helpers
 *   JSONUtil    clone, merge, path-based get, field import/export, encryption
 *   MetaUtil    the type-label -> class-constructor registry
 *   StringUtil  "{0}"-style template formatting
 *   Base64      base64 encode/decode
 *   Util        random ids, hashing
 *
 * ---------------------------------------------------------------------------
 * THE REGISTRY (MetaUtil)
 * ---------------------------------------------------------------------------
 *
 *   MetaUtil.RegisterType(MyClass, 'my_type')   // usually via RegisterSelf()
 *   MetaUtil.GetClassByType('my_type')          // -> constructor, or null
 *
 * The registry deliberately lives on `global`, not in module state: when a
 * dependency tree carries more than one copy of this package, every copy must
 * still see one shared map, or deserialization breaks depending on which copy
 * wrapped the data. That is a trap, not an accident -- do not "fix" it into a
 * module-level Map.
 *
 * ---------------------------------------------------------------------------
 * WHAT A CALLER MUST NOT ASSUME
 * ---------------------------------------------------------------------------
 * - Lookups return honest nulls (`GetClassByType(): JSClass | null`); a
 *   never-registered type is `null`, not an exception, and the caller decides
 *   how loud to be.
 * - `DataUtil` coercions take `unknown` and guess on purpose (`toBoolean`
 *   maps "yes"/"on"/"1" to true); use them at input boundaries, not as a
 *   substitute for typed data.
 */

export { default as DataUtil } from './DataUtil';
export { default as JSONUtil } from './JSONUtil';
export { default as Base64 } from './Base64';
export { default as MetaUtil } from './MetaUtil';
export { default as StringUtil } from './StringUtil';
export { default as Util } from './Util';
