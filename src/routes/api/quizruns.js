import Router from "koa-router";
import { QuizRunService, QuizAnswerService, QuizQuestionService } from "../../services";
import { validateQuizRunProps } from "./quizruns.validate";
import { validateInteger } from "../../utils/ValidationErrors";
import log from "../../utils/log";
import {
  onPlayerSubmitAnswer,
  getQuestion,
  authenticateGameAdmin,
  authenticateGamePlayer
} from "../../services/socketutils.pusher";
import pusher from "../../services/pusher-setup";

const router = new Router({ prefix: "/api/user/quizruns" });

router.post("/authadmin", async ctx => {
  try {
    await authenticateGameAdmin(ctx.request.body, pusher, "quiz");
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/authplayer", async ctx => {
  try {
    const res = await authenticateGamePlayer(pusher, ctx.request.body, "quiz");
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// admin
router.post("/getnextquestion", async ctx => {
  try {
    await getQuestion(pusher, ctx.request.body, new QuizQuestionService(), "quiz");
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// player
router.post("/submitanswer", async ctx => {
  try {
    const res = await onPlayerSubmitAnswer(
      pusher,
      ctx.request.body,
      new QuizAnswerService(),
      "quiz"
    );

    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.post("/create", async ctx => {
  try {
    validateQuizRunProps(ctx.request.body);
    const res = await new QuizRunService().save(ctx.request);

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
