import Router from "koa-router";
import { apiSuccess } from "../utils";
import { UserService } from "../services";
const router = new Router();

//NOTE: Routes here DO NOT require login

router.post("/register", async ctx => {
  try {
    const respBody = await new UserService().processUserRegistration(ctx.request.body);
    ctx.body = respBody;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/verifyuser", async ctx => {
  try {
    const respBody = await new UserService().verifyUser(ctx.request.query.token);
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
    ctx.body = respBody.user;
    ctx.set("Access-Control-Expose-Headers", "x-sign");
    ctx.set("x-sign", respBody.token);
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/logout", ctx => {
  ctx.body = apiSuccess();
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
