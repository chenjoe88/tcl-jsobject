/**
 * Types: the public surface.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS SUBSYSTEM IS FOR
 * ---------------------------------------------------------------------------
 * The type vocabulary the whole package speaks: plain JSON shapes
 * (`JSONValue`, `JSONObject`, `JSONArray`), the type-label alias (`JSType`),
 * and `JSClass`, the contract a registrable class constructor satisfies.
 *
 * This is the bottom layer. It imports nothing, and both `util` and `model`
 * import from it -- which is the point: `MetaUtil` (util) and `JSObject`
 * (model) can share `JSClass` without either reaching into the other.
 *
 * ---------------------------------------------------------------------------
 * WHAT A CALLER MUST NOT ASSUME
 * ---------------------------------------------------------------------------
 * `JSClass` is structural, not nominal. Any constructor matches it; the
 * optional statics (`GetTypeID`, `GetClass`, `GetName`) are what the registry
 * looks for, and their absence falls back to the constructor's own `name`.
 * Instances built through a `JSClass` are `any` at this level: the registry
 * hands back constructors whose instance shape only the registering caller
 * knows.
 */

export type {
    JSType,
    JSONValue,
    JSONObject,
    JSONArray,
    JSClass,
    JSProperties,
} from './JSTypes';
