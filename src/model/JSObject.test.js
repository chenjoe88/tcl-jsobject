import MetaUtil from '../util/MetaUtil';
import JSObject from './JSObject';


class Sub1 extends JSObject {
  constructor() {
    super(undefined, Sub1);
  }

  static GetClass() {
    return Sub1;
  }
  static GetTypeID() {
    return 's1';
  }
};
MetaUtil.RegisterType(Sub1);

describe('JSObject', () => {
  let /** @type {JSObject} */ jsobject;

  let props;
  let plabel1;
  let pvalue1;
  let pvalue2;
  let objectId;

  beforeEach(() => {
    jsobject = new JSObject();
    objectId = '232123';
    pvalue1 = 20;
    pvalue2 = '10/01/77';
    props = {
      plabel1: pvalue1,
      plabel2: pvalue2
    };
  });

  it('Basic properties and transformations', () => {
    expect(jsobject.getClassname()).toEqual(JSObject.name);
    expect(jsobject.getClassname()).toEqual(JSObject.GetClassName());

    // WARNING: These will fail if the class names are garbled
    expect(jsobject.getClass()).toEqual(JSObject.GetClass());
    expect(jsobject.getClass()).toEqual(JSObject);

    jsobject._setId(objectId);
    expect(jsobject.getId()).toEqual(objectId);

  });

  it('Type Instantiation', () => {
    const subobj = new Sub1();
    subobj._setId(objectId);

    expect(subobj.getClass()).toEqual(Sub1);
    expect(subobj.getClassname()).toEqual(Sub1.name);
    expect(subobj instanceof Sub1).toBeTruthy();

    const subjson = subobj.getData(false);
    expect(subjson[JSObject.PROP_ID]).toEqual(objectId);
    expect(subjson[JSObject.PROP_TYPE]).toEqual(Sub1.GetTypeID());

    const rewrapped = JSObject.Wrap(subjson);
    expect(rewrapped.getClass()).toEqual(Sub1);
    expect(rewrapped.getClass()).toEqual(Sub1.GetClass());
    expect(rewrapped.getClassname()).toEqual(Sub1.name);

  });

  it('Set/Get Object', () => {
    const obj1 = {
      f1: true,
      f2: false
    };
    jsobject.setObject('obj1', obj1);
    expect(jsobject.getObject('obj1')).toEqual(obj1);
  });

  it('Set/Get Parent Container Object', () => {
    const parent = {
      f1: true,
      f2: false
    };
    jsobject.setJSParent(parent);
    expect(jsobject.getJSParent(null)).toEqual(parent);
  });

  it('Settings fields inf an embedded JSON within JSON', () => {
    const label = 'wobj';
    const f1 = 'name';
    const v1 = 'Sam';
    const f2 = 'age';
    const v2 = 16;
    const f3 = 'addr';
    const v3 = '123 Main Street';
    jsobject.setObjectField(label, f1, v1);
    expect(jsobject.getObjectField(label, f1, 'abc')).toEqual(v1);
    jsobject.setObjectField(label, f2, v2);
    expect(jsobject.getObjectField(label, f2, 'blah')).toEqual(v2);
    jsobject.setObjectField(label, f3, v3);
    expect(jsobject.getObjectField(label, f3, '34')).toEqual(v3);
  });

  it('Getter/Setters', () => {
    const f1 = 'name';
    const v1 = 'Sam';
    const f2 = 'age';
    const v2 = 16;
    const f3 = 'addr';
    const v3 = '123 Main Street';

    expect(jsobject.has(f1)).toBeFalsy();
    jsobject.set(f1, v1);
    expect(jsobject.get(f1, 'abc')).toEqual(v1);
    expect(jsobject.has(f1)).toBeTruthy();
    jsobject.set(f2, v2);
    expect(jsobject.get(f2, 'blah')).toEqual(v2);
    jsobject.set(f3, v3);
    expect(jsobject.get(f3, '34')).toEqual(v3);

    const emptyField = 'empty';
    expect(jsobject.has(emptyField)).toBeFalsy();
    jsobject.set(emptyField, '');
    expect(jsobject.get(emptyField, null)).toEqual('');
    expect(jsobject.has(emptyField)).toBeTruthy();
    expect(jsobject.has(emptyField, true)).toBeTruthy();
    expect(jsobject.has(emptyField, false)).toBeTruthy();

    const nullField = 'null';
    jsobject.set(nullField, null);
    expect(jsobject.get(nullField, 'hi')).toEqual('hi');
    expect(jsobject.has(nullField)).toBeTruthy();
    expect(jsobject.has(nullField, true)).toBeTruthy();
    expect(jsobject.has(nullField, false)).toBeFalsy();


    const fields = [f1, f2, f3, 'f0'];
    const values = jsobject.getMultiple(fields, 'bad');
    expect(values.length).toEqual(fields.length);
    expect(values[0]).toEqual(v1);
    expect(values[1]).toEqual(v2);
    expect(values[2]).toEqual(v3);
    expect(values[3]).toEqual('bad');

    const fv = {
      [f1]: v1,
      [f2]: v2,
      [f3]: v3,
    };
    const allFields = Object.keys(fv);
    const fieldCount = allFields ? allFields.length : 0;
    for (let k = 0; k < fieldCount; k++) {
      const label = allFields[k];
      const value = jsobject.get(label, 'baaadddd');
      expect(value).toEqual(fv[label]);
    }
  });

  it('Name management', () => {
    expect(jsobject.getName('default')).toEqual('default');
    jsobject.setName('TestObject');
    expect(jsobject.getName()).toEqual('TestObject');
    jsobject.setName('Renamed');
    expect(jsobject.getName()).toEqual('Renamed');
  });

  it('Typed getters - getBoolean', () => {
    jsobject.set('flag', true);
    expect(jsobject.getBoolean('flag')).toBe(true);

    jsobject.set('flag', false);
    expect(jsobject.getBoolean('flag')).toBe(false);

    // Default when field missing
    expect(jsobject.getBoolean('missing')).toBe(false);
    expect(jsobject.getBoolean('missing', true)).toBe(true);

    // Numeric truthy/falsy
    jsobject.set('num1', 1);
    expect(jsobject.getBoolean('num1')).toBe(true);
    jsobject.set('num0', 0);
    expect(jsobject.getBoolean('num0')).toBe(false);
  });

  it('Typed getters - getNumber', () => {
    jsobject.set('count', 42);
    expect(jsobject.getNumber('count')).toEqual(42);

    // String-to-number conversion
    jsobject.set('strnum', '99');
    expect(jsobject.getNumber('strnum')).toEqual(99);

    // Default when field missing
    expect(jsobject.getNumber('missing', -1)).toEqual(-1);
  });

  it('Field operations - clear', () => {
    jsobject.set('temp', 'value');
    expect(jsobject.has('temp')).toBeTruthy();
    jsobject.clear('temp');
    expect(jsobject.has('temp')).toBeFalsy();

    // Clearing non-existent field returns false
    expect(jsobject.clear('nonexistent')).toBe(false);
  });

  it('Field operations - getLabels', () => {
    jsobject.set('alpha', 1);
    jsobject.set('beta', 2);
    const labels = jsobject.getLabels();
    expect(labels).toContain('alpha');
    expect(labels).toContain('beta');
    // Also contains the type prop set by constructor
    expect(labels).toContain(JSObject.PROP_TYPE);
  });

  it('Field operations - getEmbedded', () => {
    jsobject.set('level1', { level2: { level3: 'deep' } });
    expect(jsobject.getEmbedded('level1.level2.level3')).toEqual('deep');
    expect(jsobject.getEmbedded('level1.level2')).toEqual({ level3: 'deep' });
    // getEmbedded does not pass defaultVal through; returns null for missing paths
    expect(jsobject.getEmbedded('level1.missing')).toBeNull();
  });

  it('Aux data - setAuxData / getAuxData', () => {
    expect(jsobject.getAuxData(false)).toBeUndefined();
    const aux = { key1: 'val1', key2: 42 };
    jsobject.setAuxData(aux);
    expect(jsobject.getAuxData()).toEqual(aux);
  });

  it('Aux data - setAuxDataField / getAuxDataField', () => {
    jsobject.setAuxDataField('color', 'blue');
    expect(jsobject.getAuxDataField('color')).toEqual('blue');
    expect(jsobject.getAuxDataField('missing', 'default')).toEqual('default');
  });

  it('Aux data - addAuxData merges', () => {
    jsobject.setAuxData({ a: 1 });
    jsobject.addAuxData({ b: 2 });
    const aux = jsobject.getAuxData();
    expect(aux.a).toEqual(1);
    expect(aux.b).toEqual(2);
  });

  it('Aux data - clearAuxData / clearAuxDataField', () => {
    jsobject.setAuxData({ x: 10, y: 20 });
    jsobject.clearAuxDataField('x');
    expect(jsobject.getAuxDataField('x', null)).toBeNull();
    expect(jsobject.getAuxDataField('y')).toEqual(20);

    jsobject.clearAuxData();
    expect(jsobject.getAuxData(false)).toBeUndefined();
  });

  it('Aux data - getWrappedAuxData', () => {
    const sub = new Sub1();
    sub._setId('aux-id');
    const subData = sub.getData(false);
    jsobject.setAuxData(subData);
    const wrapped = jsobject.getWrappedAuxData();
    expect(wrapped).toBeTruthy();
    expect(wrapped.getId()).toEqual('aux-id');
    expect(wrapped.getClass()).toEqual(Sub1);
  });

  it('Data management - setData / getData', () => {
    const newData = { _t_: 't_jsobject', foo: 'bar' };
    const prevData = jsobject.setData(newData);
    expect(jsobject.getData()).toBe(newData);
    expect(jsobject.get('foo')).toEqual('bar');
    // prevData is the original data object
    expect(prevData).toBeDefined();
  });

  it('Data management - cloneData', () => {
    jsobject.set('original', 'value');
    const cloned = jsobject.cloneData();
    expect(cloned.original).toEqual('value');
    // Mutating clone does not affect original
    cloned.original = 'changed';
    expect(jsobject.get('original')).toEqual('value');
  });

  it('Data management - cloneInstance', () => {
    jsobject._setId('clone-src');
    jsobject.set('field1', 'abc');
    const cloned = jsobject.cloneInstance();
    expect(cloned).toBeInstanceOf(JSObject);
    // Cloned instance has its own data copy
    expect(cloned.get('field1')).toEqual('abc');
    cloned.set('field1', 'xyz');
    expect(jsobject.get('field1')).toEqual('abc');
  });

  it('Serialization - toJSON with include/exclude', () => {
    jsobject.set('a', 1);
    jsobject.set('b', 2);
    jsobject.set('c', 3);

    // No filters returns raw data
    const all = jsobject.toJSON();
    expect(all.a).toEqual(1);
    expect(all.b).toEqual(2);

    // Include only
    const included = jsobject.toJSON(['a', 'c']);
    expect(included.a).toEqual(1);
    expect(included.c).toEqual(3);
    expect(included.b).toBeUndefined();

    // Exclude
    const excluded = jsobject.toJSON(null, ['b']);
    expect(excluded.a).toEqual(1);
    expect(excluded.b).toBeUndefined();
    expect(excluded.c).toEqual(3);
  });

  it('Serialization - toJSONString', () => {
    jsobject.set('x', 100);
    const str = jsobject.toJSONString();
    expect(typeof str).toEqual('string');
    const parsed = JSON.parse(str);
    expect(parsed.x).toEqual(100);
  });

  it('Serialization - Serialize / DeSerialize round-trip', () => {
    const sub = new Sub1();
    sub._setId('ser-1');
    sub.set('payload', 'data');
    sub.setAuxData({ meta: 'info' });

    const serialized = JSObject.Serialize(sub);
    expect(serialized.data).toBeDefined();
    expect(serialized.aux).toBeDefined();
    expect(serialized.serial).toEqual(Sub1.GetTypeID());

    const deserialized = JSObject.DeSerialize(serialized);
    expect(deserialized).toBeInstanceOf(Sub1);
    expect(deserialized.getId()).toEqual('ser-1');
    expect(deserialized.get('payload')).toEqual('data');
    expect(deserialized.getAuxDataField('meta')).toEqual('info');
  });

  it('Timestamps - setCreatedTS / getCreatedTS', () => {
    expect(jsobject.getCreatedTS(-1)).toEqual(-1);
    jsobject.setCreatedTS(1000000);
    expect(jsobject.getCreatedTS()).toEqual(1000000);
  });

  it('Timestamps - getUpdatedTS / getTS fallback', () => {
    jsobject.setCreatedTS(500);
    // No updated TS, so getTS falls back to createdTS
    expect(jsobject.getTS(-1)).toEqual(500);

    // After setting updated, getTS returns updated
    const data = jsobject.getData(true);
    JSObject.SetUpdatedTS(data, 900);
    expect(jsobject.getUpdatedTS()).toEqual(900);
    expect(jsobject.getTS()).toEqual(900);
  });

  it('Dirty state tracking', () => {
    // At base JSObject level dirty delegates to parent
    // Without parent, isDirty/clearDirty return null/false
    expect(jsobject.isDirty()).toBeNull();
    expect(jsobject.clearDirty()).toBe(false);
  });

  it('Static wrapping - Wrap / Unwrap', () => {
    const json = { _t_: 's1', _id_: 'w1', color: 'red' };
    const wrapped = JSObject.Wrap(json);
    expect(wrapped).toBeInstanceOf(Sub1);
    expect(wrapped.getId()).toEqual('w1');
    expect(wrapped.get('color')).toEqual('red');

    const unwrapped = JSObject.Unwrap(wrapped);
    expect(unwrapped).toBe(wrapped.getData());
    expect(unwrapped._id_).toEqual('w1');
  });

  it('Static wrapping - WrapArray', () => {
    const arr = [
      { _t_: 's1', _id_: 'a1' },
      { _t_: 's1', _id_: 'a2' },
    ];
    const wrapped = JSObject.WrapArray(arr, Sub1);
    expect(wrapped.length).toEqual(2);
    expect(wrapped[0]).toBeInstanceOf(Sub1);
    expect(wrapped[1].getId()).toEqual('a2');
  });

  it('Static wrapping - IsInstance / IsWrapped', () => {
    const obj = new JSObject();
    expect(JSObject.IsInstance(obj)).toBe(true);
    expect(JSObject.IsWrapped(obj)).toBe(true);
    expect(JSObject.IsInstance({})).toBe(false);
    expect(JSObject.IsWrapped({})).toBe(false);
  });

  it('Static wrapping - CreateNew', () => {
    // When jsonData is provided, setData replaces data after _setId,
    // so the id must be in jsonData or set afterward
    const created = JSObject.CreateNew('new-1', { _id_: 'new-1', color: 'green' });
    expect(created).toBeInstanceOf(JSObject);
    expect(created.getId()).toEqual('new-1');
    expect(created.get('color')).toEqual('green');

    // Without jsonData, ID is retained
    const idOnly = JSObject.CreateNew('id-only', null);
    expect(idOnly.getId()).toEqual('id-only');
  });

  it('Static wrapping - CloneData', () => {
    const src = { a: 1, b: { c: 2 } };
    const cloned = JSObject.CloneData(src);
    expect(cloned).toEqual(src);
    cloned.b.c = 99;
    expect(src.b.c).toEqual(2);
  });

  it('Static field operations - SetId / GetId', () => {
    const json = {};
    JSObject.SetId(json, 'UPPER');
    expect(json._id_).toEqual('upper'); // lowercased
    expect(JSObject.GetId(json)).toEqual('upper');
  });

  it('Static field operations - SetName / GetName', () => {
    const json = {};
    JSObject.SetName(json, 'MyName');
    expect(JSObject.GetName(json)).toEqual('MyName');
    expect(JSObject.GetName({}, 'fallback')).toEqual('fallback');
  });

  it('Static field operations - HasObjectField / ClearObjectField', () => {
    const json = { x: 10, y: null };
    expect(JSObject.HasObjectField(json, 'x')).toBe(true);
    expect(JSObject.HasObjectField(json, 'y')).toBe(true);
    expect(JSObject.HasObjectField(json, 'y', false)).toBe(false); // null value
    expect(JSObject.HasObjectField(json, 'z')).toBe(false);

    JSObject.ClearObjectField(json, 'x');
    expect(JSObject.HasObjectField(json, 'x')).toBe(false);
  });

  it('Static field operations - ImportObjectFields', () => {
    const target = { a: 1, b: 2 };
    // ImportObjectFields always copies all props from source into target
    JSObject.ImportObjectFields(target, { b: 99, c: 3 });
    expect(target.a).toEqual(1);
    expect(target.b).toEqual(99);
    expect(target.c).toEqual(3);

    // Returns old values that were replaced
    const replaced = JSObject.ImportObjectFields(target, { a: 100 });
    expect(target.a).toEqual(100);
    expect(replaced.a).toEqual(1);
  });

  it('Static field operations - GetObjectFields with include/exclude', () => {
    const json = { a: 1, b: 2, c: 3, d: 4 };
    const subset = JSObject.GetObjectFields(json, ['a', 'c'], null);
    expect(subset.a).toEqual(1);
    expect(subset.c).toEqual(3);
    expect(subset.b).toBeUndefined();

    const excluded = JSObject.GetObjectFields(json, null, ['d']);
    expect(excluded.a).toEqual(1);
    expect(excluded.d).toBeUndefined();
  });

  it('Instance import/export object fields', () => {
    jsobject.set('k1', 'v1');
    jsobject.set('k2', 'v2');

    // importObjectFields copies all props into data
    jsobject.importObjectFields({ k2: 'new', k3: 'v3' });
    expect(jsobject.get('k2')).toEqual('new');
    expect(jsobject.get('k3')).toEqual('v3');

    jsobject.importObjectFields({ k1: 'updated' });
    expect(jsobject.get('k1')).toEqual('updated');

    // getObjectFields - extract subset
    const subset = jsobject.getObjectFields(['k1', 'k3'], null);
    expect(subset.k1).toEqual('updated');
    expect(subset.k3).toEqual('v3');
    expect(subset.k2).toBeUndefined();

    // hasObjectField / clearObjectField
    expect(jsobject.has('k2')).toBeTruthy();
    jsobject.clear('k2');
    expect(jsobject.has('k2')).toBeFalsy();
  });

});
