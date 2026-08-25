
class Util {

  static GenRandom(seed: (number | null) = null, bytes: number = 4, base: number = 36) {
    const byteMask: object = {
      2: 0x0000FFFF,
      4: 0xFFFFFFFF,
      8: 0x0000FFFFFFFFFFFF,
      16: 0xFFFFFFFFFFFFFFFF,
    };
    if (seed == null) {
      seed = Date.now();
    } else if (typeof seed !== 'number') {
      seed = Util.HashString(seed);
    }
    // @ts-ignore
    const v = seed & byteMask[bytes];
    return ((v < 0) ? -v : v).toString(base).toUpperCase();
  }

  static GenRandomLong() {
    const s = Math.trunc(Math.random() * 10000000000000);
    return s;
  }

  /**
   *
   * @param list list of objects
   * @param label property label to check matching value
   * @param value value to match
   * @returns index position if matched, -1 if no match
   */
  static ArrayIndexOf(list: [], label: string, value: any): number {

    let idx = 0;

    const len = list ? list.length : 0;
    for (let i = 0; i < len; i++) {
      const item = list[i];
      if (item[label] == value) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Remove an item from array / list
   *
   * @param list list to remove item from
   * @param value value to match. Must be exact
   * @returns index position of the removed item, -1 means not found
   */
  static ArrayRemoveItem(list:any[], value:any): number {
    // @ts-ignore
    const index = list.indexOf(value);
    if (index > 0) {
      list.splice(index, 1);
    }
    return index;
  }

  /**
   *
   * @param n number to ensure unsigned
   *
   * NOTE: boundary conditions: TBD
   *
   * @returns unsigned number
   */
  static Unsigned(n: number): number {
    return n >>> 0;
  }

  /**
   * Hash the given string into some hash code
   *
   * @param {string} s shouild be, or we'll try to make it a string.
   * @return {number} hashed code unless there was exception. zero for error
   */
  static HashString(s: string): number {
    if (s == null) {
      return 0;
    }
    if (typeof s !== 'string') { s = String(s); }
    let hashedVal: number;
    try {
      hashedVal = s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    } catch (e) {
      hashedVal = 0;
    }
    return (hashedVal < 0) ? -hashedVal : hashedVal;
  }

}

export default Util;
