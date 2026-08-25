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



});
