import compose from "koa-compose";
import helmet from "koa-helmet";
import logger from "koa-logger";
import cors from "koa-cors";
import convert from "koa-convert";
import bodyParser from "koa-bodyparser";
import session from "koa-generic-session";
import { sign, verify } from "jsonwebtoken";
// import { PermissionService } from "./services";

function corsConfig() {
  const accessControlMaxAge = "1200";

  const allowedOrigins = ["http://localhost:8080", "http://localhost:2001"];

  const accessControlAllowMethods = ["OPTIONS", "GET", "POST", "PUT", "DELETE", "HEAD"];

  const accessControlAllowHeaders = [
    // "X-Requested-With",
    // "If-Modified-Since",
    // "DNT",
    // "Pragma",
    "x-sign",
    "Cache-Control",
    "Keep-Alive",
    "User-Agent",
    "Content-Type",
    "Authorization"
  ];

  return {
    origin: allowedOrigins,
    methods: accessControlAllowMethods,
    headers: accessControlAllowHeaders,
    expose: "Authorization",
    maxAge: accessControlMaxAge,
    credentials: true
  };
}

function getTokenFromHeaderOrQuerystring(req) {
  if (!req) return null;
  if (req.header.authorization && req.header.authorization.split(" ")[0] === "Bearer") {
    return req.header.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  } else if (req.body && req.body.token) {
    return req.body.token;
  }
  return null;
}

async function handleError(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit("error", err, ctx);
  }
}
/*
 jwt token model:
 { 
    u: user.email, 
    p: [] // list of permission ids for this user
};
user model:
 { 
    u: user.email, 
    f: user.firstname, 
    l: user.lastname, 
    r: "", // the user roles. Client may need it for display
};
 */
async function authorizeRequest(ctx, next) {
  let decodedToken;
  try {
    if (ctx.request.url.startsWith("/api2/")) {
      let token = getTokenFromHeaderOrQuerystring(ctx.request);
      decodedToken = verify(token, process.env.APP_SECRET);
      if (!decodedToken) {
        ctx.throw(401, "No jwt token");
      }
      const permissionName = `${ctx.request.method} ${ctx.request.url}`;
      if (decodedToken.p.indexOf(permissionName) < 0) {
        ctx.throw(401, "Unauthorized request");
      }
      //   const permission = await new PermissionService().getByName(permissionName);
      //   if (permission) {
      //     // decodedToken.perms.
      //   }
    }
    await next();
  } finally {
    if (decodedToken) {
      //TODO: Maybe consider implementing sliding session. Like below
      // ctx.set("Access-Control-Expose-Headers", "x-sign");
      // decodedToken.l = Date.now();
      // const newToken = sign(decodedToken, process.env.APP_SECRET, { expiresIn: "5m" });
      // ctx.set("x-sign", newToken);
    }
  }
}

export default function middleware() {
  return compose([
    helmet(),
    bodyParser(),
    convert(session()),
    logger(),
    handleError,
    convert(cors(corsConfig())),
    authorizeRequest
  ]);
}
