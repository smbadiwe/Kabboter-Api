import Koa from "koa";
import Router from "koa-router";
import { SurveyRunService, SurveyAnswerService } from "../../services";
import { validateSurveyRunProps } from "./surveyruns.validate";
import log from "../../utils/log";

const router = new Router({ prefix: "/api/user/surveyruns" });

router.post("/create", async ctx => {
  try {
    validateSurveyRunProps(ctx.request.body);

    const res = await new SurveyRunService().save(ctx.request.body);

    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
