// changing this to ES6 style is problematic.
require("babel-register");
const path = require("path");
const BASE_PATH = __dirname;
const dotenv = require("dotenv");
dotenv.load({ path: path.join(BASE_PATH, "../../.env") });
module.exports = {
  test: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    },
    migrations: {
      tableName: "knex_migrations",
      directory: path.join(BASE_PATH, "migrations")
    },
    seeds: {
      directory: path.join(BASE_PATH, "seeds")
    }
  },
  development: {
    client: "mysql",
    connection: {
      host: process.env.APP_DB_HOST,
      database: process.env.APP_DB_NAME,
      user: process.env.APP_DB_USR,
      password: process.env.APP_DB_PWD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: path.join(BASE_PATH, "migrations")
    },
    seeds: {
      directory: path.join(BASE_PATH, "seeds")
    }
  },
  staging: {
    client: "mysql",
    connection: {
      host: process.env.APP_DB_HOST,
      database: process.env.APP_DB_NAME,
      user: process.env.APP_DB_USR,
      password: process.env.APP_DB_PWD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: path.join(BASE_PATH, "migrations")
    },
    seeds: {
      directory: path.join(BASE_PATH, "seeds")
    }
  },
  production: {
    client: "mysql",
    connection: {
      socketPath: `/cloudsql/${process.env.APP_DB_HOST}`,
      database: process.env.APP_DB_NAME,
      user: process.env.APP_DB_USR,
      password: process.env.APP_DB_PWD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: path.join(BASE_PATH, "migrations")
    },
    seeds: {
      directory: path.join(BASE_PATH, "seeds")
    }
  }
};
