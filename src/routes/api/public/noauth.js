import Router from "koa-router";
import { apiSuccess } from "../../../utils";
import { ValidationError } from "../../../utils/ValidationErrors";
import { UserService } from "../../../services";
import knex from "../../../db/connection";
import * as knexfile from "../../../db/knexfile";

const router = new Router({ prefix: "/api/public" });

//NOTE: Routes here DO NOT require login

router.get("/getsecurityquestion", async ctx => {
  try {
    const { username } = ctx.request.query;
    const user = await new UserService().getByUsernameOrEmailOrPhone(username);
    if (!user) {
      throw new ValidationError("Username (or phone or email) is incorrect.");
    }
    const res = {
      username: username,
      securityquestion: user.securityquestion
    };
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/validatesecurityquestion", async ctx => {
  try {
    const respBody = await new UserService().validateSecurityQuestion(ctx.request.body);
    ctx.body = respBody;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/resetpassword", async ctx => {
  try {
    const respBody = await new UserService().processResetPassword(ctx.request.body);
    ctx.body = respBody;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/register", async ctx => {
  try {
    const respBody = await new UserService().processUserRegistration(ctx.request.body);
    ctx.body = respBody;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// POST /login
router.post("/login", async ctx => {
  try {
    const { username, password, rememberme } = ctx.request.body;
    const respBody = await new UserService().processLogin(username, password, rememberme);
    ctx.body = respBody;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/logout", ctx => {
  ctx.body = apiSuccess();
});

router.get("/initdb", async ctx => {
  try {
    const BASE_PATH = __dirname; // process.cwd();
    const path = require("path");
    console.log("from /initdb: __dirname = " + BASE_PATH);
    let config = knexfile[process.env.NODE_ENV || "production"];
    config.knexfile = path.join(BASE_PATH, "../../../db/knexfile.js");
    console.log("from /initdb: config.knexfile = " + config.knexfile);
    console.log(config);
    await knex.migrate.latest(config);
    //await knex.seed.run(config);
    ctx.body = apiSuccess("knex migrate and seed ran successfully");
  } catch (e) {
    console.log(e);
    ctx.throw(e.status || 400, e);
  }
});

router.get("/", ctx => {
  ctx.body = apiSuccess("Hello world");
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
