import Router from "koa-router";
import { QuizService, UserService } from "../../services";
import * as validate from "./quizzes.validate";

const router = new Router({ prefix: "/api/user" });

router.get("/quizzes", async ctx => {
  try {
    const userId = ctx.request.query.uid;
    validate.validateInteger(userId);
    const res = await new QuizService().getByUserId(userId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/profile", async ctx => {
  try {
    const userId = ctx.request.query.uid;
    validate.validateInteger(userId);
    const res = await new UserService().getUserProfile(userId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/changepassword", async ctx => {
  try {
    validate.validateChangePassword(ctx.request.body);

    const { uid, oldPwd, newPwd } = ctx.request.body;
    const res = await new UserService().changePassword(uid, oldPwd, newPwd);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
