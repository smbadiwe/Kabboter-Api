import config from "../../../../../Users/SuperUser/AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/knex";
import * as knexfile from "./knexfile";
import log from "../utils/log";

const environment = process.env.NODE_ENV || "production";
log.debug("NODE_ENV: " + environment);
let knexConfiguration;
switch (environment) {
  case "production":
    knexConfiguration = knexfile.production;
    break;
  case "staging":
    knexConfiguration = knexfile.staging;
    break;
  case "test":
    knexConfiguration = knexfile.test;
    break;
  case "development":
  default:
    knexConfiguration = knexfile.development;
    break;
}

const knex = config(knexConfiguration);

export default knex;
