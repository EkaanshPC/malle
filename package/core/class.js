//-----------------------------------------------------------------------------------------------------------
//#region Helpers
import getArrFromSpread, { areAllTypes } from "../helpers/arrHelpers";
import { cM } from "../helpers/consoleManager";
import isUndefined from "../helpers/isUndefined";
import loop from "../helpers/loop";
import checkFormat from "../helpers/objHelpers";
import isType from "../helpers/typeHelpers";

const expector = {
  checkSchemas(schemas, debug = false) {
    const schemasArr = getArrFromSpread(schemas);
    if (!schemasArr) {
      new cM.error("Could not get array from spread in expector.", debug);
      return false;
    }

    if (!areAllTypes(schemasArr, "object")) {
      new cM.error("The schema array must consist of only objects.", debug);
      return false;
    }

    for (const schema of schemasArr) {
      if (
        !checkFormat(
          { name: "string", type: "string", optional: "boolean", aliasNames: "array", spread: "boolean" },
          schema,
        )
      ) {
        new cM.error(
          "Invalid format in schema object. (expected {name, type, optional?, aliasNames?, spread?})",
          debug,
        );
        return false;
      }

      schema.optional = !!schema.optional;
      schema.spread = !!schema.spread;

      if (!isUndefined(schema.aliasNames)) {
        if (!Array.isArray(schema.aliasNames) || !areAllTypes(schema.aliasNames, "string")) {
          new cM.error("schema.aliasNames must be an array of strings", debug);
          return false;
        }
      } else {
        schema.aliasNames = [];
      }

      if (!schema.spread && typeof schema.type === "string" && /\[\]$/.test(schema.type)) {
        schema.spread = true;
      }
    }

    return schemasArr;
  },
};

const guessor = {
  guessBy(args, schemas, mode, debug = false) {
    if (debug) {
      cM.log(`[Malle] guessing with mode: ${mode}`, true);
      cM.log(["args:", args], true);
      cM.log(["schemas:", schemas], true);
    }

    if (mode === "loose") return this.looseModeGuessor(args, schemas, debug);
    return this.strictModeGuessor(args, schemas, debug);
  },
  /**
   *
   * @param {Array} args
   * @param {Array} schemas
   * @param {"strict"|"loose"} mode
   * @param {Boolean} debug
   */
  looseModeGuessor(args, schemas, debug) {
    const result = {};
    const errors = [];
    const consumed = new Set();

    for (let s = 0; s < schemas.length; s++) {
      const schema = schemas[s];
      let found = false;

      for (let a = 0; a < args.length; a++) {
        if (consumed.has(a)) continue;
        if (isType(args[a], "object")) {
          const keys = [schema.name].concat(schema.aliasNames || []);
          for (const k of keys) {
            if (!isUndefined(args[a][k])) {
              result[schema.name] = args[a][k];
              consumed.add(a);
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      if (!found && schema.spread) {
        let elemType = null;
        if (typeof schema.type === "string") {
          if (/\[\]$/.test(schema.type)) elemType = schema.type.replace(/\[\]$/, "");
          else elemType = schema.type;
        }

        const collected = [];
        for (let a = 0; a < args.length; a++) {
          if (consumed.has(a)) continue;
          if (isType(args[a], elemType)) {
            collected.push(args[a]);
            consumed.add(a);
          }
          else if (isType(args[a], elemType + "[]")) {
            collected.push(...args[a]);
            consumed.add(a);
          }
        }

        if (collected.length > 0) {
          result[schema.name] = collected;
          found = true;
        }
      }

      if (!found) {
        for (let a = 0; a < args.length; a++) {
          if (consumed.has(a)) continue;
          if (isType(args[a], schema.type)) {
            result[schema.name] = args[a];
            consumed.add(a);
            found = true;
            break;
          }
        }
      }

      if (!found) {
        if (schema.optional) {
          result[schema.name] = undefined;
        } else {
          errors.push({
            name: schema.name,
            expected: schema.type,
            message: `missing required argument '${schema.name}' of type '${schema.type}' (loose mode)`,
          });
        }
      }
    }

    const success = errors.length === 0;
    const report = Object.assign({}, result, { __DidSucceed: success, __errors: errors });
    if (!success && debug) cM.log(["malle: loose-mode guess errors", errors], true);
    return report;
  },  strictModeGuessor(args, schemas, debug) {
    const result = {};
    const errors = [];
    let onArgCounter = 0;

    for (let s = 0; s < schemas.length; s++) {
      const schema = schemas[s];
      let found = false;

      // 1) try named object property or any alias
      for (let a = 0; a < args.length; a++) {
        if (isType(args[a], "object")) {
          const keys = [schema.name].concat(schema.aliasNames || []);
          for (const k of keys) {
            if (!isUndefined(args[a][k])) {
              result[schema.name] = args[a][k];
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      if (!found) {
        if (schema.spread) {
          let elemType = null;
          if (typeof schema.type === "string") {
            if (/\[\]$/.test(schema.type)) elemType = schema.type.replace(/\[\]$/, "");
            else elemType = schema.type;
          }

          const collected = [];
          let i = onArgCounter;
          for (; i < args.length; i++) {
            if (isType(args[i], elemType)) {
              collected.push(args[i]);
            } else break;
          }

          if (collected.length > 0) {
            result[schema.name] = collected;
            onArgCounter = i;
            found = true;
          } else if (isType(args[onArgCounter], elemType + "[]")) {
            result[schema.name] = args[onArgCounter];
            onArgCounter = onArgCounter + 1;
            found = true;
          }
        } else {
          let consumedIndex = -1;
          for (let i = onArgCounter; i < args.length; i++) {
            if (isType(args[i], schema.type)) {
              consumedIndex = i;
              break;
            }
          }

          if (consumedIndex !== -1) {
            result[schema.name] = args[consumedIndex];
            onArgCounter = consumedIndex + 1;
            found = true;
          }
        }

        if (!found) {
          if (schema.optional) {
            result[schema.name] = undefined;
          } else {
            errors.push({
              name: schema.name,
              expected: schema.type,
              message: `missing required argument '${schema.name}' of type '${schema.type}'`,
            });
          }
        }
      }
    }

    const success = errors.length === 0;
    const report = Object.assign({}, result, { __DidSucceed: success, __errors: errors });
    if (!success && debug) cM.log(["malle: guess errors", errors], true);
    return report;
  },
};
//#endregion Helpers
//-----------------------------------------------------------------------------------------------------------
//#region Main Class
/**
 * Class representing a Malle argument parser instance.
 */
export default class MalleClass {
  #modes = ["strict", "loose"];
  #mode = "strict";
  #debug = false;

  #isValidMode(mode) {
    return this.#modes.includes(mode);
  }

  constructor(config = {}) {
    const { mode, debug } = config;

    if (!isUndefined(mode) && this.#isValidMode(mode)) {
      this.#mode = mode;
    }

    if (!isUndefined(debug)) {
      this.#debug = !!debug;
    }
  }

  setDebug(value) {
    this.#debug = !!value;
    return this;
  }

  setMode(mode) {
    if (this.#isValidMode(mode)) {
      this.#mode = mode;
    }
    return this;
  }

  /**
   * Define expected argument schemas
   */
  expect(...schemas) {
    const arr = expector.checkSchemas(schemas, this.#debug);
    if (!arr) return false;

    return {
      guess: (...args) =>
        guessor.guessBy(getArrFromSpread(args), arr, this.#mode, this.#debug),
    };
  }
}
//#endregion Main Class
//-----------------------------------------------------------------------------------------------------------
