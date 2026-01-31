# Malle


**Malle** (*short for **Malleable***) is a **fast, flexible, developer-first** argument parser for **modern JavaScript and Node.js**.

It allows functions to accept arguments in **any order**, intelligently infer intent, and validate inputs without relying on rigid, positional APIs.

<div style="color:white;text-shadow:1px 1px 1px #000; border-radius: 8px; border-shadow: 1px 1px 1px #000; padding: 12px; background-color: #76eaff;">
  <strong>Information</strong>  
  This package is a briklab sub-package
</div>


---

## Features

- **Order-agnostic arguments**
    
    Accept arguments in any order without sacrificing clarity or safety.
    
- **Type inference & guessing**
    
    Automatically matches arguments based on type, name, and configurable rules.
    
- **Composable & extensible**
    
    Define schemas, constraints, defaults, and custom resolvers.
    
---

## 📦 Installation

**npm**

```bash
npm install @briklab/malle
```

**pnpm**

```bash
pnpm add @briklab/malle
```

**yarn**

```bash
yarn add @briklab/malle
```

**bun**

```bash
bun add @briklab/malle
```

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
  );

  if (!__DidSucceed) return;

  const [a, b, c] = [Number1, Number2, Mode];

  return c === "subtract" ? a - b
       : c === "add"      ? a + b
       : c === "divide"   ? a / b
       :                    a * b;
}
```

