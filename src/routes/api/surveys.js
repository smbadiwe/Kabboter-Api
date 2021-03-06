import Router from "koa-router";
import { SurveyService } from "../../services";
import { validateInteger } from "../../utils/ValidationErrors";
import { validateSurveyProps, validateSurveyBatchCreateProps } from "./surveys.validate";

const router = new Router({ prefix: "/api/user/surveys" });

router.post("/create", async ctx => {
  try {
    validateSurveyProps(ctx.request.body);

    const res = await new SurveyService().create(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/batchcreate", async ctx => {
  try {
    validateSurveyBatchCreateProps(ctx.request.body);

    const res = await new SurveyService().createBatch(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/update", async ctx => {
  try {
    validateSurveyProps(ctx.request.body, true);

    const res = await new SurveyService().update(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/published", async ctx => {
  try {
    const res = await new SurveyService().getBy({ published: true });
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/publish", async ctx => {
  try {
    const payload = ctx.request.body;
    validateInteger(payload.id, "id", true);

    const res = await new SurveyService().publish(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/unpublish", async ctx => {
  try {
    const payload = ctx.request.body;
    validateInteger(payload.id, "id", true);
    const res = await new SurveyService().unpublish(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const res = await new SurveyService().deleteRecord(ctx.params.id, ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/my", async ctx => {
  try {
    const searchParams = ctx.request.query;
    searchParams.userId = ctx.request.user.id;
    const res = await new SurveyService().getRecordsPaged(searchParams);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/", async ctx => {
  try {
    const res = await new SurveyService().getRecordsPaged(ctx.request.query);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const wq = ctx.request.query.wq;
    const withoutQuestions = !wq || wq !== "y";
    const res = await new SurveyService().getBy({ id: ctx.params.id }, withoutQuestions);
    ctx.body = res[0];
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
