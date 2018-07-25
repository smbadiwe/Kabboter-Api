import Router from "koa-router";
import { QuizRunService, QuizAnswerService, QuizQuestionService } from "../../services";
import { validateQuizRunProps } from "./quizruns.validate";
import { validateInteger } from "../../utils/ValidationErrors";
import log from "../../utils/log";

if (process.env.USE_SOCKET_IO !== "true") {
  import * as pusherServices from "../../services/pusher/socketutils.pusher";
  import pusher from "../../services/pusher/pusher-setup";
}

const router = new Router({ prefix: "/api/user/quizruns" });

if (process.env.USE_SOCKET_IO !== "true") {
  // i.e., if we're using Pusher
  router.post("/authadmin", async ctx => {
    try {
      await pusherServices.authenticateGameAdmin(ctx.request.body, pusher, "quiz");
    } catch (e) {
      ctx.throw(e.status || 500, e);
    }
  });

  router.post("/authplayer", async ctx => {
    try {
      const res = await pusherServices.authenticateGamePlayer(pusher, ctx.request.body, "quiz");
      ctx.body = res;
    } catch (e) {
      ctx.throw(e.status || 500, e);
    }
  });

  // admin
  router.post("/getnextquestion", async ctx => {
    try {
      await pusherServices.getQuestion(pusher, ctx.request.body, new QuizQuestionService(), "quiz");
    } catch (e) {
      ctx.throw(e.status || 500, e);
    }
  });

  // player
  router.post("/submitanswer", async ctx => {
    try {
      const res = await pusherServices.onPlayerSubmitAnswer(
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
}

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
