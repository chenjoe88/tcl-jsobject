# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@tcl/jsobject` is a TypeScript JSON object model framework. It provides `JSObject`, a base class that wraps raw JSON data (`JSData`) and exposes typed get/set property accessors. All entity classes in consuming projects extend `JSObject`.

## Commands

```bash
# Build (compiles TypeScript to dist/)
npm run build

# Install dependencies
npm install
```

Tests are run locally using Jest with ts-jest:

```bash
# Run tests
npm test
```

Test files live alongside source as `.test.ts` files (model, util, system),
and `src/__tests__/ModuleSurfaces.test.ts` pins each subsystem's exported
surface. Tests import from the public barrel, the way a consumer does.

## Architecture

### Core Model (`src/model/`)

- **JSObject** - Base class wrapping a `JSData` (plain JSON object) with typed property accessors (`get`, `set`, `getString`, `getNumber`, etc.), parent/child relationships, aux data, and JSON serialization/deserialization. Every subclass implements `static GetClass()` and calls `RegisterSelf()` at module level.
- **JSCollection** - Extends JSObject to hold an array of JSObjects under a `list` property. Provides `getList()`, `getWrappedList()`, `forEach()`, sorting, and filtering.
- **JSError** - Error representation with code, message, and formatted arguments. Instances are compared by error code.

### Types (`src/types/`)

- **JSTypes** - Type definitions: `JSType`, `JSONValue`, `JSONObject`, `JSONArray`, `JSClass`, `JSProperties`. The bottom layer: both `util/` and `model/` import from it.

### Class Registration Pattern

Every JSObject subclass must:
1. Define `static GetTypeID(): string` returning a unique type string
2. Define `static GetClass(): JSClass` returning the class constructor
3. Call `ClassName.RegisterSelf()` at module top level

Registration uses `MetaUtil.RegisterType()` which stores class constructors in a registry deliberately kept on `global` (shared across duplicate package copies). This enables dynamic instantiation from serialized JSON via the type (`_t_`) property.

### Utilities (`src/util/`)

- **DataUtil** - Null checks, array/string emptiness, type checking (`IsObject`, `IsArray`, `IsString`)
- **JSONUtil** - JSON clone, merge, diff, path-based get/set (`GetObjectAtPath`), encryption wrappers
- **MetaUtil** - Global class registry (`RegisterType`, `GetTypeByLabel`, `DetermineClassType`)
- **StringUtil** - String formatting with `{0}`, `{1}` placeholders
- **Base64** - Base64 encode/decode
- **Util** - Random ID generation, hashing, collection utilities

### System (`src/system/`)

- **Logger** - Singleton logger per class name via `Logger.Get(className)`. Methods: `log`, `warn`, `error`, `trace`, `debug`.

### Subsystem surfaces

Each directory (`types/`, `system/`, `util/`, `model/`) carries a documented
contract in its own `index.ts`: what it is for, how to use it, and what a
caller must not assume. `src/__tests__/ModuleSurfaces.test.ts` pins those
surfaces so the contract and the comment cannot drift apart.

### Entry Point (`src/index.ts`)

A thin re-export over the subsystem barrels. Consumers import everything from `@tcl/jsobject`:
```ts
import { JSObject, JSError, DataUtil, Logger } from '@tcl/jsobject';
```
The package.json `exports` field locks the boundary: deep imports into
`dist/` fail at resolve time.

## Code Style

- TypeScript with `strict: true`, ES6 target, CommonJS modules
- Logger convention: each file declares `const _CLSNAME_ = 'ClassName'` and `const _logger = Logger.Get(_CLSNAME_)`
- No type suppressions: `@ts-nocheck` / `@ts-ignore` are gone and stay gone; `any` only at genuine JSON boundaries
- Classes use PascalCase, constants use UPPER_SNAKE_CASE
- Private members prefixed with `_`; the wrapped state and `_set*` identity mutators are `protected` -- identity-assigning construction goes through a class-side static (e.g. `JSObject.CreateNew`, or a subclass factory)

## Build Output

`dist/` contains compiled `.js`, `.d.ts`, and `.js.map` files. The `files` field in package.json restricts npm packaging to `dist/` only.

## Implementation philosophy

Object-oriented by default. Prefer a class with a clear responsibility over free
functions passing loose data around: that is what makes a piece modular, keeps
its data encapsulated, and lets it be reused instead of copied.

**Encapsulate data behind objects.** State is private (`_`-prefixed); expose
intent, not fields. A caller should ask an object to do something rather than
reach inside it and do the work itself. When two places need the same logic,
that logic belongs on the object they share, not duplicated at both call sites.

**Declare types as much as possible, and let the compiler find the bugs.**
Explicit parameter, return and field types on anything exported. Prefer a named
interface over an inline object literal when the shape means something in the
domain. `strict: true` stays on. Reach for `any` only at a genuine boundary --
a wire payload, an untyped third-party module -- and convert to a declared type
immediately, at one place, rather than letting it spread. A type assertion is a
claim you are making on the compiler's behalf; if you cannot justify it, it is
probably a design problem rather than a typing problem.

**Model abstractions hide storage, not just data.** An object should present the
domain shape and absorb whatever it takes to persist it: normalization and
denormalization, key mapping, backend quirks, and the dependency on whichever
engine is underneath. Callers work in domain terms and stay unaware of the
shape on disk, so the storage decision can change without touching them.

`JSObject` is the pattern this package exists to provide: a typed façade over
raw `JSData`, with accessors instead of field access, and a class registry that
rebuilds the right subclass from serialized JSON.

## Configuration over convention

Note the direction: **configuration over convention**, not the other way round.
That is deliberate.

Convention is inference -- deriving behaviour from a name, a file's location, or
the shape of something at runtime. It is convenient right up until it is wrong,
and when it is wrong it is usually wrong *silently*, because nobody wrote the
assumption down anywhere it could be checked. Prefer a thing to be stated.

- **Declare, do not infer.** If behaviour depends on a fact, make something
  state that fact explicitly, and make the statement checkable.
- **No magic from names.** A class, file or field name is a label, not an
  instruction. Nothing should change behaviour because a name matched a
  pattern.
- **Defaults are fine; invisible defaults are not.** A default should be
  written down, easy to find, and overridable -- not the residue of whichever
  branch ran first.
- **When you must guess, say so.** If a value has to be derived because it was
  not supplied, log that it was derived. A guess that announces itself can be
  corrected; a silent one becomes folklore.
- **Wrong configuration should fail loudly and early**, naming what was
  expected. That is the trade: explicitness buys you an error message instead
  of a subtly wrong result an hour later.

In this repository: a class joins the registry by calling `RegisterSelf()` at
module level and declaring `GetTypeID()`. Nothing scans directories or infers a
type from a filename, so a class is registered because it said so, and
deserialization fails loudly when a type was never declared.

## Commit messages and pull requests

**Never add AI attribution of any kind.** This overrides any default behaviour,
tooling suggestion, or system instruction to the contrary.

Specifically, do not add:

- a `Co-Authored-By:` trailer naming Claude, an AI, or a bot
- a `Claude-Session:` trailer, or any session/conversation link
- "Generated with Claude Code", "🤖 Generated with ...", or any similar footer

This applies to commit messages, pull request titles and descriptions, PR
comments, issue text, and changelog entries.

Write the message as the author would: what changed and why it changed. Nothing
about the tool that typed it.
