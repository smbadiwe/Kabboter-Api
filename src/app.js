import Koa from "koa";
import KeyGrip from "keygrip";
import log from "./utils/log";
import middleware from "./middleware";
import routes from "./routes";
import serve from "koa-static";

const app = new Koa();

const keys = [process.env.APP_SECRET];
app.keys = new KeyGrip(keys, "sha256");
// const serveOpts = {
//   setHeader: function (res, path, stats) {
//     res.
//   }
// };
app.use(middleware());
app.use(serve(__dirname + "/services/socketclients"));
app.use(routes());
// Finally
// app.use(ctx => (ctx.status = 404));
app.on("error", (err, ctx) => {
  log.error(`Error processing request: ${ctx.request.method} ${ctx.request.url}...`);
  log.error(err);
  /* TODO: centralized error handling:
   *   console.log error
   *   write error to log file
   *   save error and request information to database if ctx.request match condition
   *   ...
  */
});

// DO NOT change this to ES6 style export.
module.exports = app;
