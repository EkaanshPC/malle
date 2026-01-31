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
    return this.strictModeGuessor(args, schemas, mode, debug);
  },
  /**
   *
   * @param {Array} args
   * @param {Array} schemas
   * @param {"strict"|"loose"} mode
   * @param {Boolean} debug
   */
  strictModeGuessor(args, schemas, mode, debug) {
    let result = {};
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
          if (typeof args[i] === schema.type) {
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
        }
      }
    }

    return result;
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
