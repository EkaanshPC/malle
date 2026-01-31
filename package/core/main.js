import MalleClass from "./class";

/**
 * The **Malle** argument parser.
 *
 * Allows functions to accept arguments in **any order**, infer intent, 
 * and validate inputs according to schemas.
 * 
 * @param {Object} [config] - Optional configuration object.
 * @param {"strict"|"loose"} [config.mode="strict"] - Parsing mode.
 *        - `"strict"`: matches types and positional args conservatively.
 *        - `"loose"`: more permissive (order-agnostic, type-aliases such as `arr`/`array` allowed).
 * @param {boolean} [config.debug=false] - If `true`, prints debug info to console.
 *
 * @returns {MalleClass}
 *
 * @remarks
 * The object returned by `expect(...).guess(...)` contains the matched keys
 * plus two meta-keys:
 *  - `__DidSucceed` (boolean) — true when all *required* schemas were satisfied
 *  - `__errors` (Array) — list of reported issues when parsing failed
 *
 * @example
 * import malle from "@briklab/malle";
 * 
 * function calc(...args) {
 *   const { Number1, Number2, Mode, __DidSucceed } = malle({mode: "strict"})
 *     .expect(
 *       {name:"Number1", type:"number"},
 *       {name:"Number2", type:"number"},
 *       {name:"Mode", type:"string"}
 *     );
 *     
 *   if(!__DidSucceed) return;
 *   return Mode === "add" ? Number1 + Number2 : Number1 - Number2;
 * }
 */
export default function malle(config) {
    return new MalleClass(config)
}

