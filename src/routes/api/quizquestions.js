import Router from "koa-router";
import { QuizService, QuizQuestionService } from "../../services";
import { validateQuizQuestionProps, validateInteger } from "./quizquestions.validate";

const router = new Router({ prefix: "/api/user" });

router.get("/quizquestions/:id", async ctx => {
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

router.get("/quizquestions", async ctx => {
  try {
    const quizId = ctx.request.query.quizId;
    validateInteger(quizId);
    const res = await new QuizQuestionService().getBy({ quizId: quizId });
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/quizquestions/create", async ctx => {
  try {
    validateQuizQuestionProps(ctx.request.body);

    const res = await new QuizQuestionService().create(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/quizquestions/update", async ctx => {
  try {
    validateQuizQuestionProps(ctx.request.body, true);

    const res = await new QuizQuestionService().edit(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/quizquestions/delete/:id", async ctx => {
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
