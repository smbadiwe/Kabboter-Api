import Router from "koa-router";
import { UserService } from "../../services";
import * as validate from "./users.validate";
const router = new Router({ prefix: "/api" });

router.get("/users", async ctx => {
  const allMembers = await new UserService().getAll();
  if (!allMembers) {
    ctx.status = 503;
  } else {
    ctx.body = allMembers;
  }
});

router.get("/users/:id", async ctx => {
  try {
    const member = await new UserService().getById(ctx.params.id);
    if (!member) {
      ctx.throw(503);
    } else {
      ctx.body = member;
    }
  } catch (err) {
    console.log(err);
    ctx.throw(503, "No member with the given id found.");
  }
});

router.post("/users/add", async ctx => {
  const payload = ctx.request.body;
  try {
    validate.validateMemberOnAdd(payload);
  } catch (e) {
    ctx.body = e.message;
    ctx.status = e.status;
    return;
  }
  const newMember = {
    email: payload.email,
    phone: payload.phone,
    lastname: payload.lastname,
    firstname: payload.firstname,
    regnumber: payload.regnumber
  };
  try {
    await new UserService().save(newMember);
  } catch (err) {
    console.log(err);
    ctx.body = "Error saving data.";
    ctx.status = 503;
  }
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
