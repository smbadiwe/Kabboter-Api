import Router from "koa-router";
import { SurveyRunService } from "../../services";
import { validateSurveyRunProps } from "./surveyruns.validate";

const router = new Router({ prefix: "/api/user/surveyruns" });

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
