import Router from "koa-router";
import { UserService } from "../../services";
import * as validate from "./members.validate";
import { validateInteger, RequestError } from "../../utils/ValidationErrors";
import Enums from "../../services/enums";
const router = new Router({ prefix: "/api/members" });

router.post("/create", async ctx => {
  const payload = ctx.request.body;
  let username;
  try {
    validate.validateMemberOnAdd(payload);

    let user = await new UserService().getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
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

    let user = await new UserService().getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
    if (user && user.id !== payload.id) {
      throw new RequestError(
        "Sorry, we already have someone with the username specified. Use the 'Forgot Password' link if you forgot your password."
      );
    }
  } catch (e) {
    ctx.throw(e.status || 500, e);
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
    ctx.throw(e.status || 500, e);
  }
});

router.post("/enabledisable", async ctx => {
  const payload = ctx.request.body;
  try {
    if (!payload) throw new RequestError("No payload");
    validateInteger(payload.id, "id", true);
    console.log("/enabledisable - payload = ");
    console.log(payload);
    if (payload.enabling) payload.enabling = payload.enabling === "true";
    await new UserService().update({ id: +payload.id, disabled: !payload.enabling });
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/players", async ctx => {
  try {
    const allMembers = await new UserService().getPlayers(ctx.request.query);
    ctx.body = allMembers;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/admins", async ctx => {
  try {
    const allMembers = await new UserService().getAdmins(ctx.request.query);
    //Set the enums into something readable
    const keys = Object.keys(Enums.UserRoleOptions);
    allMembers.data.forEach(r => {
      r.roles = keys.find(key => Enums.UserRoleOptions[key] === +r.roles);
    });
    ctx.body = allMembers;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/:id", async ctx => {
  try {
    const recordId = ctx.params.id;
    validateInteger(recordId, "id", true);
    const member = await new UserService().getById(recordId);
    if (!member) throw new RequestError("No member with the given id found.");
    member.roles = Object.keys(Enums.UserRoleOptions).find(
      key => Enums.UserRoleOptions[key] === +member.roles
    );
    ctx.body = member;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
