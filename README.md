# @tcl/jsobject

A TypeScript JSON object model framework. Provides `JSObject`, a base class that wraps raw JSON data and exposes typed property accessors. All entity classes in consuming projects extend `JSObject`.

## Installation

```bash
npm install @tcl/jsobject
```

## Usage

```ts
import { JSObject, JSCollection, JSError, DataUtil, Logger } from '@tcl/jsobject';
```

### Defining a subclass

```ts
import { JSObject, JSClass } from '@tcl/jsobject';

class MyEntity extends JSObject {
  static GetTypeID(): string { return 'MyEntity'; }
  static GetClass(): JSClass { return MyEntity; }

  getName(): string { return this.getString('name'); }
  setName(v: string) { this.set('name', v); }
}

MyEntity.RegisterSelf();
```

### Working with instances

```ts
const entity = new MyEntity();
entity.setName('hello');
console.log(entity.getName()); // 'hello'
console.log(entity.toJSON());  // serialized JSON with class metadata
```

## Core API

| Class / Utility | Description |
|---|---|
| `JSObject` | Base class wrapping a plain JSON object with typed get/set accessors, parent/child relationships, and serialization |
| `JSCollection` | Extends JSObject to hold an array of JSObjects with list operations, sorting, and filtering |
| `JSError` | Error representation with code, message, and formatted arguments |
| `DataUtil` | Null checks, array/string emptiness, type guards |
| `JSONUtil` | JSON clone, merge, diff, path-based get/set, encryption wrappers |
| `MetaUtil` | Global class registry for dynamic instantiation from serialized JSON |
| `StringUtil` | String formatting with `{0}`, `{1}` placeholders |
| `Base64` | Base64 encode/decode |
| `Util` | Random ID generation, hashing, collection utilities |
| `Logger` | Singleton logger per class name |

## Build

```bash
npm run build
```

## License

AGPL-3.0
