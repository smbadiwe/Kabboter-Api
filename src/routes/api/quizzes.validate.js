import * as valError from "../../utils/ValidationErrors";
import { ElectionService, MemberService } from "../../services";

export function validateInteger(integer) {
  if (integer === null || integer === undefined) throw new valError.NoDataReceived();

  if (isNaN(integer)) throw new valError.ValidationError("Value is not a number");
}
