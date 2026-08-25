

/**
 * Utility functions on strings all in one place.
 *
 */
export class StringUtil {

  /**
   * Format a string output similar to console.log() but to
   * a string instead of stdout
   *
   * NOTE: This is not efficient implementation at the moment
   *
   * @param template template similar to input to console.log
   * @param args variable arguments to inject in template
   * @returns formatted string
   */
  static FormatString(template:string, ...args:any):string {
    const _argc = args ? args.length : 0;
    let _s = template;
    for (let i = 0; i < _argc; i++) {
      _s = _s.replace(`{${i}}`, args[i]);
    }
    return _s;
  }

}

export default StringUtil;
