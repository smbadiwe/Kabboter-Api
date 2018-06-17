import * as valError from "../../utils/ValidationErrors";

export function validateInteger(integer) {
  if (integer === null || integer === undefined) throw new valError.NoDataReceived();

  if (isNaN(integer)) throw new valError.ValidationError("Value is not a number");
}

export function validateChangePassword(payload) {
  if (!payload) throw new valError.NoDataReceived();

  if (payload.uid === null || payload.uid === undefined) throw new valError.Required("uid");
  if (isNaN(payload.uid)) throw new valError.ValidationError("Value is not a number");

  if (!payload.oldPwd) throw new valError.Required("oldPwd");
  if (!payload.newPwd) throw new valError.Required("newPwd");
  // TODO: Validate password rules
}
