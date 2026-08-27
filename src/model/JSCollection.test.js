import MetaUtil from '../util/MetaUtil';
import JSObject from './JSObject';
import JSCollection from './JSCollection';


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
}
MetaUtil.RegisterType(Sub1);

describe('JSCollection', () => {
  let /** @type {JSCollection} */ col;

  beforeEach(() => {
    col = new JSCollection();
  });

  // ---- Constructor & class basics ----

  it('Default constructor creates JSCollection instance', () => {
    expect(col).toBeInstanceOf(JSCollection);
    expect(col.getClassname()).toEqual('JSCollection');
    expect(col.getClass()).toEqual(JSCollection);
  });

  it('Constructor with initial objects array populates list', () => {
    const items = [{ name: 'a' }, { name: 'b' }];
    const col2 = new JSCollection(items);
    const list = col2.getList();
    expect(list.length).toBe(2);
    expect(list[0].name).toBe('a');
    expect(list[1].name).toBe('b');
  });

  // ---- setList / getList ----

  it('setList replaces list, getList retrieves it', () => {
    const items = [{ x: 1 }, { x: 2 }];
    col.setList(items);
    const list = col.getList();
    expect(list).toBe(items);
    expect(list.length).toBe(2);
  });

  it('getList(true) creates empty list if none exists', () => {
    const list = col.getList(true);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it('getList(false) returns falsy when no list', () => {
    const col2 = new JSCollection();
    const list = col2.getList(false);
    expect(list).toBeFalsy();
  });

  // ---- Counting — getItemCount / size ----

  it('getItemCount returns correct count after adding items', () => {
    col.addItem({ a: 1 });
    col.addItem({ a: 2 });
    expect(col.getItemCount()).toBe(2);
  });

  it('getItemCount returns 0 for empty collection', () => {
    expect(col.getItemCount()).toBe(0);
  });

  it('size is alias for getItemCount', () => {
    col.addItem({ a: 1 });
    col.addItem({ a: 2 });
    col.addItem({ a: 3 });
    expect(col.size()).toBe(3);
    expect(col.size()).toBe(col.getItemCount());
  });

  // ---- getItemAt ----

  it('getItemAt retrieves item at valid index', () => {
    const item = { val: 42 };
    col.addItem(item);
    expect(col.getItemAt(0)).toBe(item);
  });

  it('getItemAt returns defaultVal for out-of-bounds index', () => {
    col.addItem({ val: 1 });
    expect(col.getItemAt(5, 'missing')).toBe('missing');
    expect(col.getItemAt(-1, 'neg')).toBe('neg');
  });

  it('getItemAt returns defaultVal when list is empty', () => {
    expect(col.getItemAt(0, 'empty')).toBe('empty');
  });

  // ---- addItem ----

  it('addItem appends item at end by default (index=-1)', () => {
    col.addItem({ n: 1 });
    col.addItem({ n: 2 });
    col.addItem({ n: 3 });
    expect(col.getItemAt(0).n).toBe(1);
    expect(col.getItemAt(1).n).toBe(2);
    expect(col.getItemAt(2).n).toBe(3);
  });

  it('addItem inserts item at specific index', () => {
    col.addItem({ n: 1 });
    col.addItem({ n: 3 });
    col.addItem({ n: 2 }, 1); // insert between 1 and 3
    expect(col.getItemAt(0).n).toBe(1);
    expect(col.getItemAt(1).n).toBe(2);
    expect(col.getItemAt(2).n).toBe(3);
  });

  it('addItem unwraps JSObject instances', () => {
    const sub = new Sub1();
    sub._setId('wrapped-add');
    col.addItem(sub);
    const rawItem = col.getItemAt(0);
    // stored as raw JSON, not as JSObject
    expect(rawItem._id_).toBe('wrapped-add');
    expect(rawItem).not.toBeInstanceOf(JSObject);
  });

  it('addItem returns true', () => {
    expect(col.addItem({ x: 1 })).toBe(true);
  });

  // ---- addXItems ----

  it('addXItems adds array of items and returns count', () => {
    const items = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const added = col.addXItems(items);
    expect(added).toBe(3);
    expect(col.getItemCount()).toBe(3);
  });

  it('addXItems skips null entries in array', () => {
    const items = [{ a: 1 }, null, { a: 3 }];
    const added = col.addXItems(items);
    expect(added).toBe(2);
    expect(col.getItemCount()).toBe(2);
  });

  it('addXItems returns 0 for null input', () => {
    expect(col.addXItems(null)).toBe(0);
  });

  it('addXObjects is alias for addXItems', () => {
    const added = col.addXObjects([{ x: 1 }, { x: 2 }]);
    expect(added).toBe(2);
    expect(col.getItemCount()).toBe(2);
  });

  // ---- forEach ----

  it('forEach iterates over wrapped list items', () => {
    col.addItem({ _t_: 's1', _id_: 'f1' });
    col.addItem({ _t_: 's1', _id_: 'f2' });
    const ids = [];
    col.forEach((item) => {
      expect(item).toBeInstanceOf(Sub1);
      ids.push(item.getId());
    });
    expect(ids).toEqual(['f1', 'f2']);
  });

  it('forEach returns null on empty collection', () => {
    const result = col.forEach(() => {});
    expect(result).toBeNull();
  });

  // ---- getWrappedList ----

  it('getWrappedList returns array of JSObject-wrapped items', () => {
    col.addItem({ _t_: 's1', _id_: 'w1', color: 'red' });
    col.addItem({ _t_: 's1', _id_: 'w2', color: 'blue' });
    const wrapped = col.getWrappedList();
    expect(wrapped.length).toBe(2);
    expect(wrapped[0]).toBeInstanceOf(Sub1);
    expect(wrapped[0].getId()).toBe('w1');
    expect(wrapped[1].get('color')).toBe('blue');
  });

  it('getWrappedList returns falsy when no list and create=false', () => {
    const col2 = new JSCollection();
    const result = col2.getWrappedList(false);
    expect(result).toBeFalsy();
  });

  it('getWrappedList with create=true returns empty array', () => {
    const col2 = new JSCollection();
    const result = col2.getWrappedList(true);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('getXItems and getXObjects are aliases for getWrappedList', () => {
    col.addItem({ _t_: 's1', _id_: 'a1' });
    const items = col.getXItems();
    const objects = col.getXObjects();
    expect(items.length).toBe(1);
    expect(objects.length).toBe(1);
    expect(items[0]).toBeInstanceOf(Sub1);
    expect(objects[0]).toBeInstanceOf(Sub1);
  });

  // ---- removeItems ----

  it('removeItems splices items from list', () => {
    col.addItem({ n: 1 });
    col.addItem({ n: 2 });
    col.addItem({ n: 3 });
    const removed = col.removeItems(1, 1);
    expect(removed.length).toBe(1);
    expect(removed[0].n).toBe(2);
    expect(col.getItemCount()).toBe(2);
    expect(col.getItemAt(0).n).toBe(1);
    expect(col.getItemAt(1).n).toBe(3);
  });

  it('removeItems can remove multiple items', () => {
    col.addItem({ n: 1 });
    col.addItem({ n: 2 });
    col.addItem({ n: 3 });
    col.addItem({ n: 4 });
    const removed = col.removeItems(1, 2);
    expect(removed.length).toBe(2);
    expect(col.getItemCount()).toBe(2);
    expect(col.getItemAt(0).n).toBe(1);
    expect(col.getItemAt(1).n).toBe(4);
  });

  it('removeItems returns empty array when no list exists', () => {
    const col2 = new JSCollection();
    expect(col2.removeItems(0, 1)).toEqual([]);
  });

  // ---- includesItem / includesItemByField / includesItemByID ----

  it('includesItem checks reference equality in list', () => {
    const item = { x: 1 };
    col.addItem(item);
    expect(col.includesItem(item)).toBe(true);
    expect(col.includesItem({ x: 1 })).toBe(false); // different reference
  });

  it('includesItem returns false when no list', () => {
    const col2 = new JSCollection();
    expect(col2.includesItem({ x: 1 })).toBe(false);
  });

  it('includesItemByField checks by field value', () => {
    col.addItem({ color: 'red' });
    col.addItem({ color: 'blue' });
    expect(col.includesItemByField('color', 'red')).toBe(true);
    expect(col.includesItemByField('color', 'green')).toBe(false);
  });

  it('includesItemByID checks by _id field', () => {
    col.addItem({ _id: 'abc' });
    expect(col.includesItemByID('abc')).toBeTruthy();
    expect(col.includesItemByID('xyz')).toBeFalsy();
  });

  it('includesXMObject checks by data reference', () => {
    const sub = new Sub1();
    sub._setId('inc-1');
    const data = sub.getData();
    col.addItem(data);
    expect(col.includesXMObject(sub)).toBe(true);
  });

  // ---- getItemByID / getItemByField (instance) ----

  it('getItemByID finds item by _id_ field', () => {
    const item = { _id_: 'target', val: 99 };
    col.addItem({ _id_: 'other', val: 1 });
    col.addItem(item);
    const found = col.getItemByID('target');
    expect(found).toBe(item);
    expect(found.val).toBe(99);
  });

  it('getItemByID returns null when not found', () => {
    col.addItem({ _id_: 'a' });
    expect(col.getItemByID('z')).toBeNull();
  });

  it('getItemByField finds item by arbitrary field', () => {
    col.addItem({ type: 'dog', name: 'Rex' });
    col.addItem({ type: 'cat', name: 'Whiskers' });
    const found = col.getItemByField('type', 'cat');
    expect(found.name).toBe('Whiskers');
  });

  it('getItemByField returns null when not found', () => {
    col.addItem({ type: 'dog' });
    expect(col.getItemByField('type', 'fish')).toBeNull();
  });

  // ---- getItemIndexByID (instance) ----

  it('getItemIndexByID returns index array for matching ID', () => {
    col.addItem({ _id_: 'a' });
    col.addItem({ _id_: 'b' });
    col.addItem({ _id_: 'c' });
    const indices = col.getItemIndexByID('b');
    expect(indices).toEqual([1]);
  });

  it('getItemIndexByID returns null when not found', () => {
    col.addItem({ _id_: 'a' });
    expect(col.getItemIndexByID('z')).toBeNull();
  });

  // ---- Array pass-throughs — includes / indexOf / length / splice ----

  it('includes delegates to array includes', () => {
    const item = { x: 1 };
    col.addItem(item);
    expect(col.includes(item)).toBe(true);
    expect(col.includes({ x: 1 })).toBe(false);
  });

  it('indexOf delegates to array indexOf', () => {
    const item1 = { x: 1 };
    const item2 = { x: 2 };
    col.addItem(item1);
    col.addItem(item2);
    expect(col.indexOf(item2)).toBe(1);
    expect(col.indexOf({ x: 3 })).toBe(-1);
  });

  it('length returns list length', () => {
    col.addItem({ a: 1 });
    col.addItem({ a: 2 });
    expect(col.length()).toBe(2);
  });

  it('splice delegates to array splice', () => {
    col.addItem({ n: 1 });
    col.addItem({ n: 2 });
    col.addItem({ n: 3 });
    const removed = col.splice(0, 1);
    expect(removed.length).toBe(1);
    expect(removed[0].n).toBe(1);
    expect(col.getItemCount()).toBe(2);
  });

  // ---- Static GetList ----

  it('Static GetList extracts list from raw JSON data', () => {
    const data = { list: [{ a: 1 }, { a: 2 }] };
    const list = JSCollection.GetList(data);
    expect(list.length).toBe(2);
    expect(list[0].a).toBe(1);
  });

  it('Static GetList creates list with create=true', () => {
    const data = {};
    const list = JSCollection.GetList(data, true);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
    expect(data.list).toBe(list);
  });

  it('Static GetList returns undefined when no list and create=false', () => {
    const data = {};
    expect(JSCollection.GetList(data, false)).toBeUndefined();
  });

  // ---- Static GetItemByField / GetItemByID ----

  it('Static GetItemByField finds item by field value', () => {
    const list = [{ name: 'Alice' }, { name: 'Bob' }];
    expect(JSCollection.GetItemByField(list, 'name', 'Bob')).toBe(list[1]);
  });

  it('Static GetItemByField returns null when not found', () => {
    const list = [{ name: 'Alice' }];
    expect(JSCollection.GetItemByField(list, 'name', 'Bob')).toBeNull();
  });

  it('Static GetItemByField returns null for null or empty list', () => {
    expect(JSCollection.GetItemByField(null, 'name', 'x')).toBeNull();
    expect(JSCollection.GetItemByField([], 'name', 'x')).toBeNull();
  });

  it('Static GetItemByID finds item by _id_', () => {
    const list = [{ _id_: 'x1' }, { _id_: 'x2' }];
    expect(JSCollection.GetItemByID(list, 'x2')).toBe(list[1]);
  });

  it('Static GetItemByID returns null when not found', () => {
    const list = [{ _id_: 'x1' }];
    expect(JSCollection.GetItemByID(list, 'x9')).toBeNull();
  });

  // ---- Static GetItemIndicesByField ----

  it('Static GetItemIndicesByField returns indices of matching items', () => {
    const list = [
      { color: 'red' },
      { color: 'blue' },
      { color: 'red' },
      { color: 'green' },
    ];
    const indices = JSCollection.GetItemIndicesByField(list, 'color', 'red');
    expect(indices).toEqual([0, 2]);
  });

  it('Static GetItemIndicesByField respects max parameter', () => {
    const list = [
      { color: 'red' },
      { color: 'red' },
      { color: 'red' },
    ];
    const indices = JSCollection.GetItemIndicesByField(list, 'color', 'red', 2);
    expect(indices).toEqual([0, 1]);
  });

  it('Static GetItemIndicesByField returns null when no match', () => {
    const list = [{ color: 'red' }];
    expect(JSCollection.GetItemIndicesByField(list, 'color', 'blue')).toBeNull();
  });

  it('Static GetItemIndicesByField returns null for null or empty list', () => {
    expect(JSCollection.GetItemIndicesByField(null, 'f', 'v')).toBeNull();
    expect(JSCollection.GetItemIndicesByField([], 'f', 'v')).toBeNull();
  });

  // ---- Static GetItemsByMatcher ----

  it('Static GetItemsByMatcher filters with custom function', () => {
    const list = [{ val: 1 }, { val: 5 }, { val: 10 }, { val: 15 }];
    const result = JSCollection.GetItemsByMatcher(list, (item) => item.val > 5);
    expect(result.length).toBe(2);
    expect(result[0].val).toBe(10);
    expect(result[1].val).toBe(15);
  });

  it('Static GetItemsByMatcher respects max', () => {
    const list = [{ val: 10 }, { val: 20 }, { val: 30 }];
    const result = JSCollection.GetItemsByMatcher(list, (item) => item.val >= 10, 2);
    expect(result.length).toBe(2);
  });

  it('Static GetItemsByMatcher returns null when no match', () => {
    const list = [{ val: 1 }];
    expect(JSCollection.GetItemsByMatcher(list, (item) => item.val > 100)).toBeNull();
  });

  it('Static GetItemsByMatcher returns null for null or empty list', () => {
    expect(JSCollection.GetItemsByMatcher(null, () => true)).toBeNull();
    expect(JSCollection.GetItemsByMatcher([], () => true)).toBeNull();
  });

  // ---- Static ArrayToWrappedArray ----

  it('Static ArrayToWrappedArray wraps JSON objects into JSObject instances', () => {
    const items = [
      { _t_: 's1', _id_: 'aw1' },
      { _t_: 's1', _id_: 'aw2' },
    ];
    const wrapped = JSCollection.ArrayToWrappedArray(items);
    expect(wrapped.length).toBe(2);
    expect(wrapped[0]).toBeInstanceOf(Sub1);
    expect(wrapped[0].getId()).toBe('aw1');
    expect(wrapped[1]).toBeInstanceOf(Sub1);
    expect(wrapped[1].getId()).toBe('aw2');
  });

  it('Static ArrayToWrappedArray accepts custom wrapper function', () => {
    const items = [{ a: 1 }, { a: 2 }];
    const wrapped = JSCollection.ArrayToWrappedArray(items, (item) => ({ ...item, wrapped: true }));
    expect(wrapped[0].wrapped).toBe(true);
    expect(wrapped[0].a).toBe(1);
    expect(wrapped[1].wrapped).toBe(true);
  });

  // ---- Static GetItemIndexByID ----

  it('Static GetItemIndexByID returns index array for matching _id_', () => {
    const list = [{ _id_: 'a' }, { _id_: 'b' }, { _id_: 'c' }];
    const result = JSCollection.GetItemIndexByID(list, 'b');
    expect(result).toEqual([1]);
  });

  it('Static GetItemIndexByID returns null when not found', () => {
    const list = [{ _id_: 'a' }];
    expect(JSCollection.GetItemIndexByID(list, 'z')).toBeNull();
  });

  // ---- Static GetName / GetTypeID / GetFolderName ----

  it('Static GetName returns class name', () => {
    expect(JSCollection.GetName()).toBe('JSCollection');
  });

  it('Static GetTypeID returns class name', () => {
    expect(JSCollection.GetTypeID()).toBe('JSCollection');
  });

  it('Static GetFolderName returns NONE', () => {
    expect(JSCollection.GetFolderName()).toBe('NONE');
  });
});
