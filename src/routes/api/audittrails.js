import Router from "koa-router";
import { AuditLogService } from "../../services";
import { validateInteger } from "../../utils/ValidationErrors";
import { EventType } from "../../services/AuditLogListener";

const router = new Router({ prefix: "/api/user/audittrails" });

router.get("/", async ctx => {
  try {
    const res = await new AuditLogService().getRecordsPaged(ctx.request.query);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/events", async ctx => {
  try {
    ctx.body = EventType;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

router.get("/:id", async ctx => {
  try {
    validateInteger(ctx.params.id, "id", true);
    const res = await new AuditLogService().getFirst(ctx.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.throw(e.status || 500, e);
  }
});

// console.log(router.stack.map(i => i));
// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
