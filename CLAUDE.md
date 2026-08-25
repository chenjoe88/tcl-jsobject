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

Test files live alongside source as `.test.js` files in `src/model/`.

## Architecture

### Core Model (`src/model/`)

- **JSObject** - Base class wrapping a `JSData` (plain JSON object) with typed property accessors (`get`, `set`, `getString`, `getNumber`, etc.), parent/child relationships, aux data, and JSON serialization/deserialization. Every subclass implements `static GetClass()` and calls `RegisterSelf()` at module level.
- **JSCollection** - Extends JSObject to hold an array of JSObjects under a `list` property. Provides `getList()`, `getWrappedList()`, `forEach()`, sorting, and filtering.
- **JSError** - Error representation with code, message, and formatted arguments. Instances are compared by error code.
- **JSTypes** - Type definitions: `JSType`, `JSONValue`, `JSONObject`, `JSONArray`, `JSClass`, `JSProperties`.

### Class Registration Pattern

Every JSObject subclass must:
1. Define `static GetTypeID(): string` returning a unique type string
2. Define `static GetClass(): JSClass` returning the class constructor
3. Call `ClassName.RegisterSelf()` at module top level

Registration uses `MetaUtil.RegisterType()` which stores class constructors in `global._REGISTRY_`. This enables dynamic instantiation from serialized JSON via the `_c_` (class) property.

### Utilities (`src/util/`)

- **DataUtil** - Null checks, array/string emptiness, type checking (`IsObject`, `IsArray`, `IsString`)
- **JSONUtil** - JSON clone, merge, diff, path-based get/set (`GetObjectAtPath`), encryption wrappers
- **MetaUtil** - Global class registry (`RegisterType`, `GetTypeByLabel`, `DetermineClassType`)
- **StringUtil** - String formatting with `{0}`, `{1}` placeholders
- **Base64** - Base64 encode/decode
- **Util** - Random ID generation, hashing, collection utilities

### System (`src/system/`)

- **Logger** - Singleton logger per class name via `Logger.Get(className)`. Methods: `log`, `warn`, `error`, `trace`, `debug`.

### Entry Point (`src/index.ts`)

Re-exports all public classes, types, constants, and utilities. Consumers import everything from `@tcl/jsobject`:
```ts
import { JSObject, JSError, DataUtil, Logger } from '@tcl/jsobject';
```

## Code Style

- TypeScript with `strict: true`, ES6 target, CommonJS modules
- Logger convention: each file declares `const _CLSNAME_ = 'ClassName'` and `const _logger = Logger.Get(_CLSNAME_)`
- `@ts-nocheck` / `@ts-ignore` used in some files for loose typing patterns inherited from JavaScript origins
- Classes use PascalCase, constants use UPPER_SNAKE_CASE
- Private members prefixed with `_`

## Build Output

`dist/` contains compiled `.js`, `.d.ts`, and `.js.map` files. The `files` field in package.json restricts npm packaging to `dist/` only.
