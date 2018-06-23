import fs from "fs";
import path from "path";
import Router from "koa-router";

const router = new Router();

//NOTE: Routes here call actual html files
const htmlFolderPath = path.join(__dirname, "../../../services/ui");

router.get("/startquizadmin", function(ctx) {
  ctx.type = "html";
  ctx.body = fs.createReadStream(htmlFolderPath + "/startquizadmin.html");
});

router.get("/quizadmin", function(ctx) {
  ctx.type = "html";
  ctx.body = fs.createReadStream(htmlFolderPath + "/quizadmin.html");
});

router.get("/startsurveyadmin", function(ctx) {
  ctx.type = "html";
  ctx.body = fs.createReadStream(htmlFolderPath + "/startsurveyadmin.html");
});

router.get("/surveyadmin", function(ctx) {
  ctx.type = "html";
  ctx.body = fs.createReadStream(htmlFolderPath + "/surveyadmin.html");
});

router.get("/login", function(ctx) {
  ctx.type = "html";
  ctx.body = fs.createReadStream(htmlFolderPath + "/login.html");
});

router.get("/", function(ctx) {
  ctx.type = "html";
  ctx.body = fs.createReadStream(htmlFolderPath + "/index.html");
});

router.get("/register", function(ctx) {
  ctx.type = "html";
  ctx.body = fs.createReadStream(htmlFolderPath + "/register.html");
});

// Don't change this to ES6 style. We use 'require' to auto-register routes
// See src/app.js
module.exports = router;
