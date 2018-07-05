import Koa from "koa";
import Router from "koa-router";
import { QuizRunService, QuizAnswerService } from "../../services";
import { validateQuizRunProps } from "./quizruns.validate";
import log from "../../utils/log";

const router = new Router({ prefix: "/api/user/quizruns" });

router.post("/create", async ctx => {
  try {
    validateQuizRunProps(ctx.request.body);
    log.debug("Creating quiz run...");
    const res = await new QuizRunService().save(ctx.request.body);
    log.debug("Done creating quiz run...");

    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
