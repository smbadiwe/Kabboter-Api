import fs from "fs";
import path from "path";
import Router from "koa-router";

const router = new Router();

//NOTE: Routes here call actual html files
const htmlFolderPath = path.join(__dirname, "../../../public");

// router.get("/quizadmin", function(ctx) {
//   ctx.type = "html";
//   ctx.set("Access-Control-Allow-Origin", "*");
//   ctx.body = fs.createReadStream(htmlFolderPath + "/quizadmin/quizadmin.html");
// });

// router.get("/quizplayer", function(ctx) {
//   ctx.type = "html";
//   ctx.set("Access-Control-Allow-Origin", "*");
//   ctx.body = fs.createReadStream(htmlFolderPath + "/quizplayer/quizplayer.html");
// });

// router.get("/surveyadmin", function(ctx) {
//   ctx.type = "html";
//   ctx.set("Access-Control-Allow-Origin", "*");
//   ctx.body = fs.createReadStream(htmlFolderPath + "/surveyadmin/surveyadmin.html");
// });

// router.get("/surveyplayer", function(ctx) {
//   ctx.type = "html";
//   ctx.set("Access-Control-Allow-Origin", "*");
//   ctx.body = fs.createReadStream(htmlFolderPath + "/surveyplayer/surveyplayer.html");
// });

// router.get("/login", function(ctx) {
//   ctx.type = "html";
//   ctx.set("Access-Control-Allow-Origin", "*");
//   ctx.body = fs.createReadStream(htmlFolderPath + "/login.html");
// });

router.get("/", function(ctx) {
  ctx.type = "html";
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.body = fs.createReadStream(htmlFolderPath + "/index.html");
});

router.get("/register", function(ctx) {
  ctx.type = "html";
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.body = fs.createReadStream(htmlFolderPath + "/register.html");
});

router.get("/playquiz", ctx => {
  ctx.redirect("/quizplayer/quizplayer.html");
});

router.get("/playvote", ctx => {
  ctx.redirect("/surveyplayer/surveyplayer.html");
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
