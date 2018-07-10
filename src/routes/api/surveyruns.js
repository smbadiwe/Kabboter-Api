import Router from "koa-router";
import { SurveyRunService } from "../../services";
import { validateSurveyRunProps } from "./surveyruns.validate";
import { validateInteger } from "../../utils/ValidationErrors";

const router = new Router({ prefix: "/api/user/surveyruns" });

router.post("/create", async ctx => {
  try {
    const gameParams = ctx.request.body;
    validateSurveyRunProps(gameParams);
    gameParams.moderatorId = ctx.request.user.id;
    validateInteger(gameParams.moderatorId, "moderatorId", true);

    const res = await new SurveyRunService().save(gameParams);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
