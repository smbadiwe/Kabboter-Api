import validator from "validator";
import * as valError from "../../utils/ValidationErrors";

export function validateMemberOnAdd(payload) {
  if (!payload) throw new valError.NoDataReceived();

  const { email, phone, lastname, firstname, regnumber } = payload;

  // Required
  if (validator.isEmpty(email)) throw new valError.Required("email");
  if (validator.isEmpty(lastname)) throw new valError.Required("lastname");
  if (validator.isEmpty(firstname)) throw new valError.Required("firstname");
  if (validator.isEmpty(regnumber)) throw new valError.Required("regnumber");

  // Lengths
  if (validator.isLength(email, { min: 1, max: 60 }))
    throw new valError.InvalidLength("email", 0, 60);
  if (validator.isLength(lastname, { min: 1, max: 60 }))
    throw new valError.InvalidLength("lastname", 0, 60);
  if (validator.isLength(firstname, { min: 1, max: 60 }))
    throw new valError.InvalidLength("firstname", 0, 60);
  if (validator.isLength(regnumber, { min: 1, max: 40 }))
    throw new valError.InvalidLength("regnumber", 0, 40);

  if (!validator.isEmail(email)) throw new valError.InvalidEmail("email");

  //=========== Sanitize ===========
  validator.trim(email);
  validator.trim(lastname);
  validator.trim(firstname);
  validator.trim(regnumber);
}
