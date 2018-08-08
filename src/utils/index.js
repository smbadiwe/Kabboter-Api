import { readdirSync, statSync } from "fs";
import { join, relative } from "path";
import upath from "upath";

/**
 * Generate a [nDigits]-digit number as PIN (default is 7 digits)
 *
 * @param nDigits The number of digits to generate. Default is 7.
 */
export function generatePin(nDigits = 7) {
  if (nDigits < 1) throw new Error("nDigits: should be an integer with value at least 1");

  let offset = Math.pow(10, nDigits - 1);
  let factor = 9 * offset;
  return Math.floor(Math.random() * factor) + offset;
}

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

export function isArray(a) {
  return !!a && a.constructor === Array;
}

export function isObject(a) {
  return !!a && a.constructor === Object;
}

export function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
