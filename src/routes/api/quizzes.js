import Router from "koa-router";
import { QuizService } from "../../services";
import { validateQuizProps, validateQuizBatchCreateProps } from "./quizzes.validate";
import { validateInteger } from "../../utils/ValidationErrors";

const router = new Router({ prefix: "/api/user/quizzes" });

router.post("/create", async ctx => {
  try {
    validateQuizProps(ctx.request.body);

    const userId = ctx.request.user.id;
    const res = await new QuizService().create(userId, ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/batchcreate", async ctx => {
  try {
    validateQuizBatchCreateProps(ctx.request.body);

    const userId = ctx.request.user.id;
    const res = await new QuizService().createBatch(userId, ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/update", async ctx => {
  try {
    validateQuizProps(ctx.request.body, true);

    const res = await new QuizService().update(ctx.request.body);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/delete/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id");
    const res = await new QuizService().deleteRecord(ctx.params.id);
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
    const res = await new QuizService().getByUserId(userId, withoutQuestions);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/my/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id");
    const wq = ctx.request.query.wq;
    const withoutQuestions = !wq || wq !== "y";
    const userId = ctx.request.user.id;
    const res = await new QuizService().getBy(
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
    const res = await new QuizService().getAll();
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
    const res = await new QuizService().getBy({ id: ctx.params.id }, withoutQuestions);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
