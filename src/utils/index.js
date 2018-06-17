import { readdirSync, statSync } from "fs";
import { join, relative } from "path";
import upath from "upath";

export function listFilesInFolderRecursively(dir, filesToExclude = [], filelist = []) {
  const files = readdirSync(dir);
  files.forEach(function(file) {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      filelist = listFilesInFolderRecursively(filePath, filesToExclude, filelist);
    } else if (filesToExclude.indexOf(filePath) < 0) {
      const item = upath.normalizeSafe(relative("", filePath));
      filelist.push(item);
    }
  });
  return filelist;
}

export function apiError(msg) {
  return {
    status: false,
    message: msg
  };
}

export function apiSuccess(responseData) {
  if (responseData) {
    return {
      status: true,
      data: responseData
    };
  }
  return {
    status: true
  };
}
