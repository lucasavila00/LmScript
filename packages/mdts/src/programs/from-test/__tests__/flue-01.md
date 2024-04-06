# Flue

A Flue represents a lazy async computation that depends on a value.

To create and execute Flues, start by importing Flue.

~~~ts
import { Flue } from "flue-ts";
~~~

## Table of contents

## Execution

Call `execute` or `toEither` with the dependency as argument to execute a Flue.

### Execute

Returns a promise that resolves with the Flue value or rejects.

```ts
const emptyDependency = undefined;

console.log(await Flue.resolve(1).execute(emptyDependency));
```

```json
1
```

### ToEither

Returns an object that represents either a success (Right) or a failure (Left).

```ts
console.log(await Flue.resolve(2).toEither(emptyDependency));
```

```js
{
  "_tag": "Right",
  "right": 2,
}
```

```ts
console.log(await Flue.reject(new Error("It failed")).toEither(emptyDependency));
```

```js
{
  "_tag": "Left",
  "left": [Error: It failed],
}
```