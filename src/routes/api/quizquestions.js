import Router from "koa-router";
import { QuizQuestionService } from "../../services";
import { validateQuizQuestionProps } from "./quizquestions.validate";
import { validateInteger } from "../../utils/ValidationErrors";

const router = new Router({ prefix: "/api/user/quizquestions" });

router.post("/create", async ctx => {
  try {
    validateQuizQuestionProps(ctx.request.body);

    const res = await new QuizQuestionService().save(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/update", async ctx => {
  try {
    validateQuizQuestionProps(ctx.request.body, true);

    const res = await new QuizQuestionService().update(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const res = await new QuizQuestionService().daleteRecord(ctx.params.id, ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/", async ctx => {
  try {
    const quizId = ctx.request.query.quizId;
    if (quizId) {
      validateInteger(quizId, "quizId", true);
    }
    const res =
      quizId > 0
        ? await new QuizQuestionService().getBy({ quizId: quizId })
        : await new QuizQuestionService().getAll();
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/:id", async ctx => {
  try {
    const recordId = ctx.params.id;
    validateInteger(recordId, "id", true);
    const res = await new QuizQuestionService().getById(recordId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
