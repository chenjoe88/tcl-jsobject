/**
 * Model: the public surface.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS SUBSYSTEM IS FOR
 * ---------------------------------------------------------------------------
 * The object model this package exists to provide: `JSObject`, a typed facade
 * over raw JSON (`JSData`), plus `JSCollection` (a JSObject holding an array
 * of them) and `JSError` (a real Error carrying a comparison code).
 *
 * ---------------------------------------------------------------------------
 * THE SHAPE OF IT
 * ---------------------------------------------------------------------------
 *
 *   raw JSData ──> JSObject.Wrap(json) ──┐         (looks up _t_ in the
 *                                        ▼          MetaUtil registry)
 *                                    JSObject
 *                                        │  get()/set(), aux data, parents
 *                                        ▼
 *                  toJSON() / Serialize() ──> raw JSData again
 *
 * ---------------------------------------------------------------------------
 * A SUBCLASS DECLARES ITSELF (configuration over convention)
 * ---------------------------------------------------------------------------
 *
 *   class Wallet extends JSObject {
 *     constructor(data?: JSData) { super(data, Wallet); }
 *     static GetTypeID() { return 'wallet'; }
 *     static GetClass() { return Wallet; }
 *   }
 *   Wallet.RegisterSelf();   // at module top level, always
 *
 * Nothing scans directories or infers a type from a filename: a class is
 * registered because it said so, and `Wrap` fails loudly (JSError 'JS_WRAP')
 * for a type that never was.
 *
 * ---------------------------------------------------------------------------
 * WHAT A CALLER MUST NOT ASSUME
 * ---------------------------------------------------------------------------
 * - `getData()` returns the LIVE backing object, not a copy. Mutating it
 *   bypasses dirty-tracking; use `set()`, or `cloneData()` for a safe copy.
 * - `JSError.equals` compares by code, never by message text.
 * - `JSCollection.getList()` also returns live storage, and its items are
 *   NOT wrapped; `getWrappedList()` wraps them.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY NOT EXPORTED
 * ---------------------------------------------------------------------------
 * The wrapped state slots and the `_set*` identity mutators are protected.
 * Construction that must assign identity goes through a static on the owning
 * class -- `JSObject.CreateNew(id, json)` here, or a subclass's own factory
 * static (which reaches the protected members legally) -- never through a
 * back door from outside.
 */

export {
    default as JSObject,
    JSData,
    PROP_MAIN_DATA,
    PROP_JSCLASS,
    PROP_ID,
    PROP_TYPE,
    PROP_PARENT,
    PROP_TRANSIENT_PARENT,
    PROP_NAME,
    PROP_AUX_DATA,
    PROP_SERIAL_TYPE,
    PROP_CREATED_DATE,
    PROP_UPDATED_DATE,
    PROP_EXPIRATION_DATE,
} from './JSObject';
export { default as JSCollection } from './JSCollection';
export { default as JSError } from './JSError';
