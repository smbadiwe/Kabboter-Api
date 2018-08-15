import Router from "koa-router";
import { QuizService, SurveyService } from "../../services";

const router = new Router({ prefix: "/api/superadmin" });

router.get("/quizzes", async ctx => {
  try {
    const res = await new QuizService().getRecordsPaged(ctx.request.query);
    console.log(res.pagination);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/surveys", async ctx => {
  try {
    const res = await new SurveyService().getRecordsPaged(ctx.request.query);
    console.log(res.pagination);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
