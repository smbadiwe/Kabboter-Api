import Router from "koa-router";
import { QuizQuestionService } from "../../services";
import { validateQuizQuestionProps, validateInteger } from "./quizquestions.validate";

const router = new Router({ prefix: "/api/user/quizquestions" });

router.get("/:id", async ctx => {
  try {
    const quizId = ctx.request.query.quizId;
    const recordId = ctx.params.id;
    validateInteger(quizId);
    validateInteger(recordId);
    const res = await new QuizQuestionService().getBy({ id: recordId, quizId: quizId });
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/", async ctx => {
  try {
    const quizId = ctx.request.query.quizId;
    validateInteger(quizId);
    const res = await new QuizQuestionService().getBy({ quizId: quizId });
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/create", async ctx => {
  try {
    validateQuizQuestionProps(ctx.request.body);

    const res = await new QuizQuestionService().save(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/update", async ctx => {
  try {
    validateQuizQuestionProps(ctx.request.body, true);

    const res = await new QuizQuestionService().update(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id);
    const res = await new QuizQuestionService().daleteRecord(ctx.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
