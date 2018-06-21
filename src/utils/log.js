import debug from "debug";
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
    console.error(this.debug.namespace + "| " + util.format(formatter, ...args));
  },
  debug: function(formatter, ...args) {
    debug_(formatter, ...args);
    console.log(this.debug.namespace + "| " + util.format(formatter, ...args));
  },
  setNamespace: function(nameSpace) {
    this.debug.namespace = `${this.debug.namespace}:${nameSpace}`;
    this.error.namespace = `${this.error.namespace}:${nameSpace}`;
  }
};

export default log;
