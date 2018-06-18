import { RequestError, Required, NoDataReceived } from "../../utils/ValidationErrors";

export function validateChangePassword(payload) {
  if (!payload) throw new NoDataReceived();

  if (!payload.oldPwd) throw new Required("oldPwd");
  if (!payload.newPwd) throw new Required("newPwd");
  if (payload.oldPwd === payload.newPwd) throw new RequestError("New password is same as old.");
  // TODO: Validate password rules
}
