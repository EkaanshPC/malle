export const cM = {
  __name: "Malle",
  error: class extends Error {
    constructor(message, debug = false) {
      super(message);
      this.name = cM.__name;

      if (debug) {
        console.log(
          "%c[Malle]: Error: %c",
          "color:red;font-weight:bold;",
          message,
          ""
        );
      }
    }
  },
  log(message,debug){
    if(!debug)return
    console.log("%c[Malle] Log: %c","color:lime;font-weight:bold;","",message)
  }
};
