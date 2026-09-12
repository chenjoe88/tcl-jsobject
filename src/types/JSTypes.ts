export type JSType = string;

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

export interface JSONObject {
    [x: string]: JSONValue;
};

export interface JSONArray extends Array<JSONValue> {}

/**
 * The contract a registrable class constructor satisfies. Every JSObject
 * subclass matches this structurally; the statics are optional because the
 * registry can also fall back to the constructor's own `name`. Instances are
 * `any` at this level: the registry hands back constructors whose instance
 * shape is only known to the caller that registered them.
 */
export interface JSClass extends Function {
    new (...args: any[]): any;
    GetTypeID?(...args: any[]): JSType;
    GetClass?(...args: any[]): JSClass;
    GetName?(...args: any[]): string;
}

export type JSProperties = {};
