/**
 * @packageDocumentation
 * 
 * Malle is a fast, flexible, developer-first argument parser for JS/Node.
 * It allows functions to accept arguments in any order, infer intent,
 * and validate inputs without rigid positional APIs.
 *
 * @example
 * import malle from "@briklab/malle";
 * function calc(...args) {
 *   const {Number1, Number2, Mode} = malle.expect(
 *     {name:"Number1", type:"number"},
 *     {name:"Number2", type:"number"},
 *     {name:"Mode", type:"string"}
 *   );
 *   return Mode === "add" ? Number1 + Number2 : Number1 - Number2;
 * }
 */
export * from "./core/main.js";