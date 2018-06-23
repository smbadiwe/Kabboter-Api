import validator from "validator";

import {
  validateInteger,
  Required,
  RequestError,
  NoDataReceived
} from "../../utils/ValidationErrors";
export { validateInteger };

export function validateSureyProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) validateInteger(payload.id, "id");

  if (!payload.title) throw new Required("title");
  if (payload.introLink && !validator.isURL(payload.introLink))
    throw new RequestError("Invalid URL provided for introLink");
}
