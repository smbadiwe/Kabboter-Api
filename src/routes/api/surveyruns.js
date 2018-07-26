import Router from "koa-router";
import { SurveyRunService, SurveyAnswerService, SurveyQuestionService } from "../../services";
import { validateSurveyRunProps } from "./surveyruns.validate";
import * as pusherServices from "../../services/pusher/socketutils.pusher";

const router = new Router({ prefix: "/api/user/surveyruns" });

if (process.env.USE_SOCKET_IO !== "true") {
  // i.e., if we're using Pusher
  router.post("/authadmin", async ctx => {
    try {
      await pusherServices.authenticateGameAdmin(ctx.request.body, pusher, "survey");
    } catch (e) {
      ctx.throw(e.status || 500, e);
    }
  });

  router.post("/authplayer", async ctx => {
    try {
      const res = await pusherServices.authenticateGamePlayer(pusher, ctx.request.body, "survey");
      ctx.body = res;
    } catch (e) {
      ctx.throw(e.status || 500, e);
    }
  });

  // admin
  router.post("/getnextquestion", async ctx => {
    try {
      await pusherServices.getQuestion(
        pusher,
        ctx.request.body,
        new SurveyQuestionService(),
        "survey"
      );
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
        new SurveyAnswerService(),
        "survey"
      );

      ctx.body = res;
    } catch (e) {
      ctx.throw(e.status || 500, e);
    }
  });
}

router.post("/create", async ctx => {
  try {
    const gameParams = ctx.request.body;
    validateSurveyRunProps(gameParams);
    const res = await new SurveyRunService().save(ctx.request);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
