import compose from "koa-compose";
import { listFilesInFolderRecursively } from "../utils";

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
  const files = listFilesInFolderRecursively(__dirname, [__filename]);
  files.forEach(item => {
    if (item && !item.endsWith(".validate.js") && item.endsWith(".js")) {
      item = item.replace("src/routes", ".").replace(".js", "");
      const router = require(item);
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
