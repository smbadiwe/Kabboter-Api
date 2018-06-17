import debug from "debug";

const debug_ = debug(`${process.env.APP_NAME}:debug`);
debug_.log = console.log.bind(console);

const error = debug(`${process.env.APP_NAME}:error`);

//TODO: See https://github.com/visionmedia/debug
// for more ways to configure log, if need be.
const log = {
  error: error,
  debug: debug_,
  setNamespace: function(nameSpace) {
    this.debug.namespace = `${this.debug.namespace}:${nameSpace}`;
    this.error.namespace = `${this.error.namespace}:${nameSpace}`;
  }
};

export default log;
