/**
 * System: the public surface.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS SUBSYSTEM IS FOR
 * ---------------------------------------------------------------------------
 * Cross-cutting runtime services. Today that is one thing: `Logger`, a
 * per-label singleton logger.
 *
 * ---------------------------------------------------------------------------
 * USING IT
 * ---------------------------------------------------------------------------
 *
 *   const _CLSNAME_ = 'MyClass';
 *   const _logger = Logger.Get(_CLSNAME_);
 *
 *   _logger.info('myMethod', 'loaded', { count });
 *   // -> "MyClass.myMethod[INFO]: loaded { count: 3 }"
 *
 * `Get(label)` always returns the one instance for that label, creating it on
 * first use. `Peek(label)` looks one up without creating. Output streams are
 * injected through the constructor (used by tests); they are private
 * afterwards -- a logger's streams cannot be swapped from outside.
 *
 * ---------------------------------------------------------------------------
 * WHAT A CALLER MUST NOT ASSUME
 * ---------------------------------------------------------------------------
 * The prefix format ("??" for errors, "!!" for warnings) is part of how
 * operators grep logs; treat it as stable.
 */

export { Logger } from './Logger';
export type { LogStream } from './Logger';
