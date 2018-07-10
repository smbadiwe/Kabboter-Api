import Router from "koa-router";
import { QuizRunService } from "../../services";
import { validateQuizRunProps } from "./quizruns.validate";
import { validateInteger } from "../../utils/ValidationErrors";
import log from "../../utils/log";

const router = new Router({ prefix: "/api/user/quizruns" });

router.post("/create", async ctx => {
  try {
    const gameParams = ctx.request.body;
    validateQuizRunProps(gameParams);
    gameParams.moderatorId = ctx.request.user.id;
    validateInteger(gameParams.moderatorId, "moderatorId", true);

    const res = await new QuizRunService().save(gameParams);

    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/topscores", async ctx => {
  try {
    const { quizRunId, limit } = ctx.request.query;
    validateInteger(quizRunId, "quizRunId", true);
    validateInteger(limit, "limit", true);
    const res = await new QuizRunService().getPlayerTotalScores(quizRunId, limit);

    log.debug("Quiz /topscores getPlayerTotalScores res = %O", res);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
