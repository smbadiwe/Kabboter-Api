import config from "knex";
import * as knexfile from "./knexfile";

const environment = process.env.NODE_ENV || "development";
console.log("NODE_ENV: " + environment);
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
