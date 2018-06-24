import Router from "koa-router";
import { UserService } from "../../services";
import * as validate from "./admins.validate";
import Enums from "../../services/enums";
const router = new Router({ prefix: "/api/user/admins" });

router.post("/create", async ctx => {
  const payload = ctx.request.body;
  let username;
  try {
    validate.validateMemberOnAdd(payload);

    let user = await this.getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
    if (user) {
      throw new RequestError(
        "Sorry, we already have someone with the username specified. Use the 'Forgot Password' link if you forgot your password."
      );
    }
    username = await generateUsername(userRegInfo.lastname, userRegInfo.firstname);
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
    username: username,
    roles: Enums.UserRoleOptions.Players,
    usertype: Enums.UserType.SocialUser
  };
  try {
    await new UserService().save(newMember);
  } catch (err) {
    console.log(err);
    ctx.body = "Error saving data.";
    ctx.status = 503;
  }
});

router.post("/update", async ctx => {
  const payload = ctx.request.body;
  try {
    validate.validateMemberOnAdd(payload);

    let user = await this.getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
    if (user && user.id !== payload.id) {
      throw new RequestError(
        "Sorry, we already have someone with the username specified. Use the 'Forgot Password' link if you forgot your password."
      );
    }
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
    usertype: Enums.UserType.SocialUser
  };
  try {
    await new UserService().save(newMember);
  } catch (err) {
    console.log(err);
    ctx.body = "Error saving data.";
    ctx.status = 503;
  }
});

router.get("/:id", async ctx => {
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

router.get("/", async ctx => {
  const allMembers = await new UserService().getPlayers(ctx.request.body);
  if (!allMembers) {
    ctx.status = 503;
  } else {
    ctx.body = allMembers;
  }
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
