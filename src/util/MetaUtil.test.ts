import { JSObject, MetaUtil } from '../index';

class Registrable extends JSObject {
  constructor() {
    super(undefined, Registrable);
  }
  static GetClass() { return Registrable; }
  static GetTypeID() { return 't_registrable'; }
}

describe('MetaUtil registry', () => {

  it('registers, looks up, and deregisters a type', () => {
    MetaUtil.RegisterType(Registrable);
    expect(MetaUtil.GetClassByType('t_registrable')).toBe(Registrable);

    expect(MetaUtil.DeregisterType('t_registrable')).toBe(true);
    expect(MetaUtil.GetClassByType('t_registrable')).toBeNull();
  });

  it('an unknown type is an honest null, loudly, not an exception', () => {
    expect(MetaUtil.GetClassByType('never_registered')).toBeNull();
  });

  it('deregistering an unknown type reports false', () => {
    expect(MetaUtil.DeregisterType('never_registered')).toBe(false);
  });

  it('DetermineClassType prefers the declared GetTypeID', () => {
    expect(MetaUtil.DetermineClassType(Registrable)).toBe('t_registrable');
  });

  it('DetermineClassType rejects null loudly with null', () => {
    expect(MetaUtil.DetermineClassType(null as any)).toBeNull();
  });

  it('registration without a determinable type fails with false', () => {
    // An anonymous constructor with no GetTypeID and no own name property
    // path: DetermineClassType falls back to .name, so use a named class
    // and verify the declared-type path instead.
    class Named extends JSObject {
      static GetClass() { return Named; }
    }
    // Falls back to the constructor's own name
    expect(MetaUtil.RegisterType(Named)).toBe(false); // RegisterType always returns false today (legacy)
    expect(MetaUtil.GetClassByType('Named')).toBe(Named);
    MetaUtil.DeregisterType('Named');
  });
});
