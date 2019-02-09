// changing this to ES6 style is problematic.
require("babel-register");
const path = require("path");
const fs = require("fs");
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
      port: process.env.APP_DB_PORT,
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
  productionOnAzure: {
    client: "mysql",
    connection: {
      host: `${process.env.APP_DB_HOST}`,
      database: process.env.APP_DB_NAME,
      user: `${process.env.APP_DB_USR}`,
      password: process.env.APP_DB_PWD,
      //port: 3306,
      ssl: {
        ca: fs.readFileSync(path.resolve(__dirname, "../kabooter.crt.pem"))
      }
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
  productionOnGoogleCloud: {
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
  },
  productionOnA2Hosting: {
    client: "mysql",
    connection: {
      host: `${process.env.APP_DB_HOST}`,
      database: process.env.APP_DB_NAME,
      user: `${process.env.APP_DB_USR}`,
      password: process.env.APP_DB_PWD
      //port: 3306,
      // ssl: {
      //   ca: fs.readFileSync(path.resolve(__dirname, "./ssl/ca-cert.pem")),
      //   cert: fs.readFileSync(path.resolve(__dirname, "./ssl/server-cert.pem")),
      //   key: fs.readFileSync(path.resolve(__dirname, "./ssl/server-key.pem"))
      // }
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
      host: `${process.env.APP_DB_HOST}`,
      database: process.env.APP_DB_NAME,
      user: `${process.env.APP_DB_USR}`,
      password: process.env.APP_DB_PWD,
      //port: 3306,
      ssl: {
        ca: fs.readFileSync(path.resolve(__dirname, "../kabooter.crt.pem"))
      }
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
