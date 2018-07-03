import Router from "koa-router";
import { SurveyService } from "../../services";
import { validateInteger } from "../../utils/ValidationErrors";
import { validateSurveyProps, validateSurveyBatchCreateProps } from "./surveys.validate";

const router = new Router({ prefix: "/api/user/surveys" });

router.post("/create", async ctx => {
  try {
    validateSurveyProps(ctx.request.body);

    const userId = ctx.request.user.id;
    const res = await new SurveyService().create(userId, ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/batchcreate", async ctx => {
  try {
    validateSurveyBatchCreateProps(ctx.request.body);

    const userId = ctx.request.user.id;
    const res = await new SurveyService().createBatch(userId, ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/update", async ctx => {
  try {
    validateSurveyProps(ctx.request.body, true);

    const res = await new SurveyService().update(ctx.request.body);
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
    payload.id = +payload.id;
    if (payload.published) {
      const res = await new SurveyService().publish(payload.id);
      ctx.body = res;
    } else {
      throw new RequestError("Invalid data submitted");
    }
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/unpublish", async ctx => {
  try {
    const payload = ctx.request.body;
    validateInteger(payload.id, "id", true);
    payload.id = +payload.id;

    const res = await new SurveyService().unpublish(payload.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const res = await new SurveyService().deleteRecord(ctx.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/my", async ctx => {
  try {
    const userId = ctx.request.user.id;
    const wq = ctx.request.query.wq;
    const withoutQuestions = !wq || wq !== "y";
    const res = await new SurveyService().getByUserId(userId, withoutQuestions);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/my/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const wq = ctx.request.query.wq;
    const withoutQuestions = !wq || wq !== "y";
    const userId = ctx.request.user.id;
    const res = await new SurveyService().getBy(
      { userId: userId, id: ctx.params.id },
      withoutQuestions
    );
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/", async ctx => {
  try {
    const res = await new SurveyService().getAll();
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id");
    const wq = ctx.request.query.wq;
    const withoutQuestions = !wq || wq !== "y";
    const res = await new SurveyService().getBy({ id: ctx.params.id }, withoutQuestions);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
