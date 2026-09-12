import { DataUtil } from '../index';

describe('DataUtil', () => {

  describe('null checks', () => {
    it('IsNull / NotNull treat null and undefined alike', () => {
      expect(DataUtil.IsNull(null)).toBe(true);
      expect(DataUtil.IsNull(undefined)).toBe(true);
      expect(DataUtil.IsNull(0)).toBe(false);
      expect(DataUtil.IsNull('')).toBe(false);
      expect(DataUtil.IsNull(false)).toBe(false);

      expect(DataUtil.NotNull(0)).toBe(true);
      expect(DataUtil.NotNull(null)).toBe(false);
      expect(DataUtil.NotNull(undefined)).toBe(false);
    });
  });

  describe('strings', () => {
    it('StringLength handles null and trim', () => {
      expect(DataUtil.StringLength(null)).toBe(0);
      expect(DataUtil.StringLength('abc')).toBe(3);
      expect(DataUtil.StringLength('  ab  ')).toBe(6);
      expect(DataUtil.StringLength('  ab  ', true)).toBe(2);
    });

    it('StringIsEmpty honors trim and nullIsEmpty', () => {
      expect(DataUtil.StringIsEmpty(null)).toBe(true);
      expect(DataUtil.StringIsEmpty('')).toBe(true);
      expect(DataUtil.StringIsEmpty('   ', true)).toBe(true);
      expect(DataUtil.StringIsEmpty('   ', false)).toBe(false);
      expect(DataUtil.StringIsEmpty('a')).toBe(false);
      // nullIsEmpty=false says a null string is NOT empty
      expect(DataUtil.StringIsEmpty(null, false, false)).toBe(false);
    });

    it('IsString detects string type only', () => {
      expect(DataUtil.IsString('x')).toBe(true);
      expect(DataUtil.IsString(1)).toBe(false);
      expect(DataUtil.IsString(null)).toBe(false);
    });

    it('StringEquals compares with options', () => {
      expect(DataUtil.StringEquals('abc', 'abc')).toBe(true);
      expect(DataUtil.StringEquals('abc', 'xyz')).toBe(false);
      // trim option
      expect(DataUtil.StringEquals(' a ', 'a', true, false, true)).toBe(true);
      expect(DataUtil.StringEquals(null, null)).toBe(true);
    });

    it('StripWrapper strips matching quotes and brackets', () => {
      expect(DataUtil.StripWrapper('"abc"')).toBe('abc');
      expect(DataUtil.StripWrapper('[abc]')).toBe('abc');
      expect(DataUtil.StripWrapper('{abc}')).toBe('abc');
      expect(DataUtil.StripWrapper("'abc'")).toBe('abc');
      // no matching wrapper: unchanged
      expect(DataUtil.StripWrapper('abc')).toBe('abc');
      expect(DataUtil.StripWrapper('"abc]')).toBe('"abc]');
      expect(DataUtil.StripWrapper(null)).toBeNull();
    });

    it('StripPrefix strips only a matching prefix', () => {
      expect(DataUtil.StripPrefix('prefix-rest', 'prefix-')).toBe('rest');
      expect(DataUtil.StripPrefix('PREFIX-rest', 'prefix-')).toBe('rest'); // ignoreCase default
      expect(DataUtil.StripPrefix('PREFIX-rest', 'prefix-', false)).toBe('PREFIX-rest');
      expect(DataUtil.StripPrefix('other', 'prefix-')).toBe('other');
    });
  });

  describe('conversions', () => {
    it('toBoolean guesses common truthy/falsy spellings', () => {
      for (const v of [true, 'true', 'T', '1', 'on', 'YES', 'y', 1, 42]) {
        expect(DataUtil.toBoolean(v)).toBe(true);
      }
      for (const v of [false, 'false', 'F', '0', 'no', 'N', 0, -1]) {
        expect(DataUtil.toBoolean(v)).toBe(false);
      }
      expect(DataUtil.toBoolean(null)).toBe(false);
      expect(DataUtil.toBoolean(null, true)).toBe(true);
      expect(DataUtil.toBoolean('garbage', true)).toBe(true); // falls to default
    });

    it('toNumber converts and defaults', () => {
      expect(DataUtil.toNumber(5)).toBe(5);
      expect(DataUtil.toNumber('5')).toBe(5);
      expect(DataUtil.toNumber('5.5')).toBe(5.5);
      expect(DataUtil.toNumber(null)).toBeNull();
      expect(DataUtil.toNumber(null, -1)).toBe(-1);
      expect(DataUtil.toNumber('abc')).toBeNaN(); // NaN is a number to this API
    });

    it('toNumberWithRange clamps into range', () => {
      expect(DataUtil.toNumberWithRange(5, 1, 10)).toBe(5);
      expect(DataUtil.toNumberWithRange(0, 1, 10)).toBe(0); // 0 is falsy: not clamped (legacy)
      expect(DataUtil.toNumberWithRange(50, 1, 10)).toBe(10);
      expect(DataUtil.toNumberWithRange('7', 1, 10)).toBe(7);
    });

    it('NumberEquals compares numeric representations', () => {
      expect(DataUtil.NumberEquals(5, '5')).toBe(true);
      expect(DataUtil.NumberEquals('5', '5.0')).toBe(true);
      expect(DataUtil.NumberEquals(5, 6)).toBe(false);
      expect(DataUtil.NumberEquals(null, null)).toBe(false);
      expect(DataUtil.NumberEquals(5, null)).toBe(false);
    });

    it('toNull maps the string "null" (and null) to null', () => {
      expect(DataUtil.toNull(null)).toBeNull();
      expect(DataUtil.toNull('null')).toBeNull();
      expect(DataUtil.toNull('NULL')).toBeNull();
      expect(DataUtil.toNull('x')).toBe('x');
      expect(DataUtil.toNull(5)).toBe('5'); // non-strings come back stringified
    });

    it('GetString normalizes strings and defaults everything else', () => {
      expect(DataUtil.GetString('  AbC ')).toBe('abc');
      expect(DataUtil.GetString('AbC', false)).toBe('AbC');
      expect(DataUtil.GetString(42)).toBeNull();
      expect(DataUtil.GetString(42, true, 'dflt')).toBe('dflt');
    });
  });

  describe('values strings', () => {
    it('Add/Remove/Get/Has round-trip a delimited values string', () => {
      let vs = DataUtil.AddValueToValuesString(null, 'read');
      expect(vs).toBe('READ');
      vs = DataUtil.AddValueToValuesString(vs, 'write');
      expect(vs).toBe('READ|WRITE');
      // duplicate is a no-op
      expect(DataUtil.AddValueToValuesString(vs, 'read')).toBe('READ|WRITE');

      expect(DataUtil.HasValueInValuesString(vs, 'write')).toBe(true);
      expect(DataUtil.HasValueInValuesString(vs, 'nope')).toBe(false);
      expect(DataUtil.HasValueInValuesString(vs, 'nope', 'read')).toBe(true);
      expect(DataUtil.HasValueInValuesString(null, 'x')).toBe(false);

      expect(DataUtil.GetValuesInValuesString(vs)).toEqual(['READ', 'WRITE']);
      expect(DataUtil.GetValuesInValuesString(null)).toEqual([]);

      vs = DataUtil.RemoveValueFromValuesString(vs, 'read');
      expect(vs).toBe('WRITE');
      expect(DataUtil.RemoveValueFromValuesString(vs, 'absent')).toBe('WRITE');
    });
  });

  describe('arrays', () => {
    it('UniqueArray removes exact duplicates in place', () => {
      const a = [1, 2, 2, 3, 1];
      const result = DataUtil.UniqueArray(a);
      expect(result).toBe(a);
      expect(result).toEqual([1, 2, 3]);
    });

    it('MergeStrings merges and dedupes, tolerating nulls', () => {
      expect(DataUtil.MergeStrings(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
      expect(DataUtil.MergeStrings(null, ['x'])).toEqual(['x']);
      expect(DataUtil.MergeStrings(['x'], null)).toEqual(['x']);
    });

    it('Union2Arrays returns set union', () => {
      expect(DataUtil.Union2Arrays([1, 2], [2, 3])).toEqual([1, 2, 3]);
    });

    it('CompareArrays goes deep', () => {
      expect(DataUtil.CompareArrays([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(DataUtil.CompareArrays([1, [2, 3]], [1, [2, 4]])).toBe(false);
      expect(DataUtil.CompareArrays([1], [1, 2])).toBe(false);
      expect(DataUtil.CompareArrays(null, [1])).toBe(false);
      const same = [1, 2];
      expect(DataUtil.CompareArrays(same, same)).toBe(true);
    });

    it('ArrayIsEmpty treats null, non-array and empty as empty', () => {
      expect(DataUtil.ArrayIsEmpty(null)).toBe(true);
      expect(DataUtil.ArrayIsEmpty('not-array')).toBe(true);
      expect(DataUtil.ArrayIsEmpty([])).toBe(true);
      expect(DataUtil.ArrayIsEmpty([1])).toBe(false);
    });

    it('RemoveFromArray removes every occurrence', () => {
      const list = ['a', 'b', 'a', 'c'];
      DataUtil.RemoveFromArray(list, 'a');
      expect(list).toEqual(['b', 'c']);
      expect(DataUtil.RemoveFromArray(null, 'x')).toBeNull();
    });

    it('ArrayToQuotedString and ArrayToJSString format arrays', () => {
      expect(DataUtil.ArrayToQuotedString(['a', 'b'])).toBe('"\'a\',\'b\'"');
      expect(DataUtil.ArrayToJSString(['a', 'b'])).toBe("['a','b']");
      expect(DataUtil.ArrayToQuotedString([])).toBe("''");
    });

    it('JSStringToArray parses a bracketed list', () => {
      expect(DataUtil.JSStringToArray('[a,b,c]')).toEqual(['a', 'b', 'c']);
      expect(DataUtil.JSStringToArray('')).toEqual([]);
      // no brackets with enforceBrackets: returned as-is
      expect(DataUtil.JSStringToArray('a,b', true)).toBe('a,b');
    });

    it('ObjectIsEmpty checks plain objects', () => {
      expect(DataUtil.ObjectIsEmpty(null)).toBe(true);
      expect(DataUtil.ObjectIsEmpty({})).toBe(true);
      expect(DataUtil.ObjectIsEmpty({ a: 1 })).toBe(false);
    });
  });
});
