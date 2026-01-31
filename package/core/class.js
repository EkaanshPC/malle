//-----------------------------------------------------------------------------------------------------------
//#region Helpers
import getArrFromSpread, { areAllTypes } from "../helpers/arrHelpers";
import { cM } from "../helpers/consoleManager";
import isUndefined from "../helpers/isUndefined";
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
      if (!checkFormat({ name: "string" }, schema)) {
        new cM.error("Invalid format in schema object.", debug);
        return false;
      }
    }

    return schemasArr;
  },
};

const guessor = {
  guessBy(args, schemas, mode, debug = false) {
    if (debug) {
      cM.log(`[Malle] guessing with mode: ${mode}`);
      cM.log("args:", args);
      cM.log("schemas:", schemas);
    }

    return true;
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
  #cache = {};

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
        guessor.guessBy(
          getArrFromSpread(args),
          arr,
          this.#mode,
          this.#debug
        ),
    };
  }
}
//#endregion Main Class
//-----------------------------------------------------------------------------------------------------------
