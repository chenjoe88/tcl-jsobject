import * as model from '../model';
import * as types from '../types';
import * as util from '../util';
import * as system from '../system';
import * as pkg from '../index';

/**
 * The subsystem surfaces are a contract, so they are tested like one.
 *
 * Each `index.ts` is meant to be enough on its own: a caller -- or a reader
 * trying to understand the package without opening every file -- imports from
 * the directory, not from a file inside it. This suite fails when a surface
 * stops exporting something it documents, which is what keeps the contract
 * and the comment describing it from drifting apart.
 *
 * It deliberately asserts only that the door exists, not what is behind it.
 * Behaviour belongs in each subsystem's own tests.
 */

const SURFACES: Array<{ name: string; surface: object; expected: string[] }> = [
  {
    name: 'model',
    surface: model,
    expected: [
      'JSObject', 'JSCollection', 'JSError',
      'PROP_MAIN_DATA', 'PROP_JSCLASS', 'PROP_ID', 'PROP_TYPE', 'PROP_PARENT',
      'PROP_TRANSIENT_PARENT', 'PROP_NAME', 'PROP_AUX_DATA', 'PROP_SERIAL_TYPE',
      'PROP_CREATED_DATE', 'PROP_UPDATED_DATE', 'PROP_EXPIRATION_DATE',
    ],
  },
  {
    name: 'util',
    surface: util,
    expected: ['DataUtil', 'JSONUtil', 'Base64', 'MetaUtil', 'StringUtil', 'Util'],
  },
  {
    name: 'system',
    surface: system,
    expected: ['Logger'],
  },
  {
    // The root re-exports the union: what consumers compile against.
    name: 'package root',
    surface: pkg,
    expected: [
      'JSObject', 'JSCollection', 'JSError',
      'PROP_MAIN_DATA', 'PROP_JSCLASS', 'PROP_ID', 'PROP_TYPE', 'PROP_PARENT',
      'PROP_TRANSIENT_PARENT', 'PROP_NAME', 'PROP_AUX_DATA', 'PROP_SERIAL_TYPE',
      'PROP_CREATED_DATE', 'PROP_UPDATED_DATE', 'PROP_EXPIRATION_DATE',
      'DataUtil', 'JSONUtil', 'Base64', 'MetaUtil', 'StringUtil', 'Util',
      'Logger',
    ],
  },
];

// `types` is types-only: nothing to assert at runtime, its exports vanish in
// compilation. The import above still proves the barrel resolves.
void types;

describe('subsystem surfaces', () => {

  for (const { name, surface, expected } of SURFACES) {
    describe(name, () => {

      it.each(expected)('exports %s', (symbol) => {
        expect(surface).toHaveProperty(symbol);
        expect((surface as Record<string, unknown>)[symbol]).toBeDefined();
      });
    });
  }

  /*
   * The surfaces are usable without reaching past them. If one of these needs
   * a deep import to work, the surface is incomplete.
   */
  describe('usable through the front door alone', () => {

    it('registers a subclass and round-trips it through Wrap', () => {
      class Doc extends pkg.JSObject {
        constructor() { super(undefined, Doc); }
        static GetClass() { return Doc; }
        static GetTypeID() { return 't_surface_doc'; }
        static NewNamed(name: string): Doc {
          const doc = new Doc();
          doc.setName(name);
          return doc;
        }
      }
      Doc.RegisterSelf();

      const doc = Doc.NewNamed('front-door');
      const rewrapped = pkg.JSObject.Wrap(doc.getData());
      expect(rewrapped).toBeInstanceOf(Doc);
      expect(rewrapped.getName()).toBe('front-door');
    });

    it('fails loudly when wrapping an undeclared type', () => {
      expect(() => pkg.JSObject.Wrap({ _t_: 'no_such_type' }))
        .toThrow(pkg.JSError);
    });

    it('compares errors by code, not message', () => {
      const a = new pkg.JSError('E1', 'one');
      const b = new pkg.JSError('E1', 'two');
      expect(a.equals(b)).toBe(true);
    });

    it('hands back the same logger per label', () => {
      expect(pkg.Logger.Get('surface')).toBe(pkg.Logger.Get('surface'));
    });

    it('coerces at boundaries with DataUtil', () => {
      expect(pkg.DataUtil.toBoolean('yes')).toBe(true);
      expect(pkg.DataUtil.StringIsEmpty('  ', true)).toBe(true);
    });

    it('collects with JSCollection through the surface', () => {
      const col = new pkg.JSCollection();
      col.addItem({ n: 1 });
      col.addItem({ n: 2 });
      expect(col.size()).toBe(2);
    });
  });
});
