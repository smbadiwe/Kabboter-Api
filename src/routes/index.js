import compose from "koa-compose";
import { listFilesInFolderRecursively } from "../utils";
import log from "../utils/log";

export default function routes() {
  const allRoutes = getExportedRoutes(getRouterMiddlewares);
  return compose(allRoutes);
}

export function getRoutesRequiringAuthorization() {
  const allRoutes = getExportedRoutes(getPermissionName);
  return allRoutes;
}

function getExportedRoutes(postProcess) {
  const allRoutes = [];
  log.debug("__dirname: " + __dirname);
  log.debug("__filename: " + __filename);
  const files = listFilesInFolderRecursively(__dirname, [__filename]);
  const path = require("path");
  files.forEach(item => {
    if (item && !item.endsWith(".validate.js") && item.endsWith(".js")) {
      const relPath = "./" + path.relative(__dirname, item).replace(".js", "");
      log.debug("route file path being required: " + relPath);
      const router = require(relPath);
      postProcess(router, allRoutes);
    }
  });
  return allRoutes;
}

function getRouterMiddlewares(router, allRoutes) {
  allRoutes.push(router.routes());
  allRoutes.push(router.allowedMethods());
}

function getPermissionName(router, allRoutes) {
  router.stack.forEach(r => {
    const method = r.methods[r.methods.length - 1]; // if 'GET', methods is usually ['HEAD', 'GET']
    const path = `${method} ${r.path}`;
    allRoutes.push(path);
  });
}
