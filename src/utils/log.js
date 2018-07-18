import debug from "../../../../../Users/SuperUser/AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/debug";
import util from "util";

const debug_ = debug(`${process.env.APP_NAME}:debug`);
debug_.log = console.log.bind(console);

const error_ = debug(`${process.env.APP_NAME}:error`);
error_.log = console.error.bind(console);

//TODO: See https://github.com/visionmedia/debug
// for more ways to configure log, if need be.
const log = {
  error: function(formatter, ...args) {
    error_(formatter, ...args);
    // console.error(error_.namespace + "| " + util.format(formatter, ...args));
  },
  debug: function(formatter, ...args) {
    debug_(formatter, ...args);
    // console.log(debug_.namespace + "| " + util.format(formatter, ...args));
  },
  setNamespace: function(nameSpace) {
    debug_.namespace = `${process.env.APP_NAME}:debug:${nameSpace}`;
    error_.namespace = `${process.env.APP_NAME}:error:${nameSpace}`;
  }
};

export default log;
