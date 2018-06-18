import Router from "koa-router";
import { QuizService } from "../../services";
import { validateQuizProps, validateInteger } from "./quizzes.validate";

const router = new Router({ prefix: "/api/user" });

router.get("/quizzes/my/:id", async ctx => {
  try {
    validateInteger(ctx.params.id);
    const userId = ctx.request.user.id;
    const res = await new QuizService().getBy({ userId: userId, id: ctx.params.id });
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});
router.get("/quizzes/my", async ctx => {
  try {
    const userId = ctx.request.user.id;
    const res = await new QuizService().getByUserId(userId);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/quizzes/:id", async ctx => {
  try {
    validateInteger(ctx.params.id);
    const res = await new QuizService().getById(ctx.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/quizzes", async ctx => {
  try {
    const res = await new QuizService().getAll();
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/quizzes/create", async ctx => {
  try {
    validateQuizProps(ctx.request.body);

    const userId = ctx.request.user.id;
    const res = await new QuizService().create(userId, ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/quizzes/update", async ctx => {
  try {
    validateQuizProps(ctx.request.body, true);

    const res = await new QuizService().edit(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/quizzes/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id);
    const res = await new QuizService().daleteRecord(ctx.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
