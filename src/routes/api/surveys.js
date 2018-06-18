import Router from "koa-router";
import { SurveyService } from "../../services";
import { validateQuizProps, validateInteger } from "./surveys.validate";

const router = new Router({ prefix: "/api/user" });

router.get("/surveys/my/:id", async ctx => {
  try {
    validateInteger(ctx.request.params.id);
    const userId = ctx.request.user.id;
    const res = await new SurveyService().getBy({ userId: userId, id: ctx.request.params.id });
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});
router.get("/surveys/my", async ctx => {
  try {
    const userId = ctx.request.user.id;
    const res = await new SurveyService().getByUserId(userId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/surveys/:id", async ctx => {
  try {
    validateInteger(ctx.request.params.id);
    const userId = ctx.request.user.id;
    const res = await new SurveyService().getByUserId(userId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/surveys", async ctx => {
  try {
    const res = await new SurveyService().getAll();
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/surveys/create", async ctx => {
  try {
    validateQuizProps(ctx.request.body);

    const userId = ctx.request.user.id;
    const res = await new SurveyService().create(userId, ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/surveys/update", async ctx => {
  try {
    validateQuizProps(ctx.request.body, true);

    const res = await new SurveyService().edit(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/surveys/delete/:id", async ctx => {
  try {
    validateInteger(ctx.request.params.id);
    const res = await new SurveyService().daleteRecord(ctx.request.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
