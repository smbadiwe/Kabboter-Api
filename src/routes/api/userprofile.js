import Router from "koa-router";
import { UserService } from "../../services";
import { validateChangePassword } from "./userprofile.validate";
import { validateUserOnAdd } from "./players.validate";

const router = new Router({ prefix: "/api/user" });

router.post("/profile/update", async ctx => {
  try {
    const userId = ctx.request.user.id;
    validateUserOnAdd(ctx.request.body);
    const res = await new UserService().updateUserProfile(userId, ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/profile", async ctx => {
  try {
    const userId = ctx.request.user.id;
    const res = await new UserService().getUserProfile(userId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/changepassword", async ctx => {
  try {
    validateChangePassword(ctx.request.body);

    const userId = ctx.request.user.id;
    const { oldPwd, newPwd } = ctx.request.body;
    const res = await new UserService().changePassword(userId, oldPwd, newPwd);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
