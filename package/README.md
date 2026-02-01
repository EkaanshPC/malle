# Malle
![GitHub forks](https://img.shields.io/github/forks/EkaanshPC/malle?style=flat-square) ![GitHub License](https://img.shields.io/github/license/EkaanshPC/malle?style=flat-square) ![GitHub commit activity](https://img.shields.io/github/commit-activity/t/EkaanshPC/malle?style=flat-square)

**Malle** (*short for **Malleable***) is a **fast, flexible, developer-first** argument parser for **modern JavaScript and Node.js**.

It allows functions to accept arguments in **any order**, intelligently infer intent, and validate inputs without relying on rigid, positional APIs.

> Wiki
> https://github.com/EkaanshPC/malle/wiki

> Github
> https://github.com/EkaanshPC/malle

---

## Features

- **Order-agnostic arguments**
    
    Accept arguments in any order without sacrificing clarity or safety.
    
- **Type inference & guessing**
    
    Automatically matches arguments based on type, name, and configurable rules.
    
- **Composable & extensible**
    
    Define schemas, constraints, defaults, and custom resolvers.
    
- **Flexible modes**

  Switch between `strict` and `loose` parsing modes to control tolerance and ordering.

---

## Quick Example

```jsx
import malle from "@briklab/malle";

function calculate(...args) {
  const {
    Number1,
    Number2,
    Mode,
    __DidSucceed
  } = malle({ mode: "strict" }).expect(
    { name: "Number1", type: "number" },
    { name: "Number2", type: "number" },
    { name: "Mode", type: "string" }
  ).guess(args);

  if (!__DidSucceed) return;

  const [a, b, c] = [Number1, Number2, Mode];

  return c === "subtract" ? a - b
       : c === "add"      ? a + b
       : c === "divide"   ? a / b
       :                    a * b;
}
```

## Optional-argument example

```js
// 'Mode' is optional — if not provided it will be `undefined` and won't
// consume positional args that follow.
import malle from "@briklab/malle";

const res = malle().expect(
  { name: "Mode", type: "string", optional: true },
  { name: "count", type: "number" }
).guess(42);

// result: { Mode: undefined, count: 42 }
console.log(res);
```


