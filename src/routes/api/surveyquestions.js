import Router from "koa-router";
import { SurveyQuestionService } from "../../services";
import { validateSurveyQuestionProps } from "./surveyquestions.validate";
import { validateInteger } from "../../utils/ValidationErrors";

const router = new Router({ prefix: "/api/user/surveyquestions" });

router.post("/create", async ctx => {
  try {
    validateSurveyQuestionProps(ctx.request.body);

    const res = await new SurveyQuestionService().save(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/update", async ctx => {
  try {
    validateSurveyQuestionProps(ctx.request.body, true);

    const res = await new SurveyQuestionService().update(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const res = await new SurveyQuestionService().daleteRecord(ctx.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/", async ctx => {
  try {
    const surveyId = ctx.request.query.surveyId;
    if (surveyId) {
      validateInteger(surveyId, "surveyId", true);
    }
    const res =
      surveyId > 0
        ? await new SurveyQuestionService().getBy({ surveyId: surveyId })
        : await new SurveyQuestionService().getAll();
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/:id", async ctx => {
  try {
    const recordId = ctx.params.id;
    validateInteger(recordId, "id", true);
    const res = await new SurveyQuestionService().getById(recordId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
