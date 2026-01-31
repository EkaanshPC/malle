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
          { name: "string", type: "string", optional: "boolean" },
          schema,
        )
      ) {
        new cM.error(
          "Invalid format in schema object. (expected {name, type, optional?})",
          debug,
        );
        return false;
      }

      schema.optional = !!schema.optional;
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
        if (isType(args[a], "object") && !isUndefined(args[a][schema.name])) {
          result[schema.name] = args[a][schema.name];
          consumed.add(a);
          found = true;
          break;
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

      for (let a = 0; a < args.length; a++) {
        if (isType(args[a], "object")) {
          if (!isUndefined(args[a][schema.name])) {
            result[schema.name] = args[a][schema.name];
            found = true;
            break;
          }
        }
      }

      if (!found) {
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
        } else if (schema.optional) {
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
