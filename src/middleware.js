import compose from "koa-compose";
import helmet from "koa-helmet";
import logger from "koa-logger";
import cors from "koa-cors";
import convert from "koa-convert";
import bodyParser from "koa-bodyparser";
import log from "./utils/log";
import { verify } from "jsonwebtoken";
import { decode } from "punycode";

function corsConfig() {
  const accessControlMaxAge = "1200";

  const allowedOrigins = ["*"];

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
    //allRoutes: true,
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

    if (!ctx.body && (ctx.method === "post" || ctx.method === "POST")) {
      ctx.body = {
        status: true
      };
    }
  } catch (err) {
    ctx.status = err.status || 500;
    // ctx.message =
    //   ctx.status === 500
    //     ? "Hey! Looks like someone stepped on the wire. We'll fix it ASAP, but not without nabbing and dealing with the guy who did this. Promise."
    //     : err.message;
    ctx.body = err;
    ctx.message = err.message;
    ctx.app.emit("error", err, ctx);
  }
}
/*
 jwt token model:
 { 
    i: user.id,
    u: user.username, 
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
  const url = ctx.request.url;
  const verifyAuth =
    url.startsWith("/api/") &&
    !url.startsWith("/api/public/") &&
    !url.endsWith(".js") &&
    !url.endsWith(".woff") &&
    !url.endsWith(".woff2") &&
    !url.endsWith(".csv") &&
    !url.endsWith(".css");

  if (verifyAuth) {
    let token = getTokenFromHeaderOrQuerystring(ctx.request);
    if (!token) {
      ctx.throw(401, "Authentication Failure. No token");
    }
    // log.debug("%s - token: %s", ctx.request.url, token);
    let decodedToken;
    try {
      decodedToken = verify(token, process.env.APP_SECRET);
      if (!decodedToken) {
        ctx.throw(401, "Authentication Failure. Token could not be verified");
      }
    } catch (e) {
      ctx.throw(401, "Authentication Failure. Token could not be verified. " + e.message);
    }
    // const permissionName = `${ctx.request.method} ${ctx.request.url}`;
    // if (decodedToken.p.indexOf(permissionName) < 0) {
    //   ctx.throw(401, "Unauthorized request");
    // }

    //finally
    log.debug("%s - decoded token: %O", ctx.request.url, decodedToken);
    ctx.request.user = {
      id: +decodedToken.i,
      username: decodedToken.u,
      permissions: decodedToken.p
    };
  } else {
    log.debug("Incoming Url: %s.", url);
  }
  if (ctx.request.body) {
    log.debug("%s: %s. Body: %O", ctx.request.method, url, ctx.request.body);
  }
  await next();
}

export default function middleware() {
  return compose([
    helmet(),
    bodyParser(),
    //convert(session()),
    logger(),
    handleError,
    convert(cors(corsConfig())),
    authorizeRequest
  ]);
}
