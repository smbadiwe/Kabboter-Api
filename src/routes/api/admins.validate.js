import validator from "validator";
import * as valError from "../../utils/ValidationErrors";

export function validateMemberOnAdd(payload, updating = false) {
  if (!payload) throw new valError.NoDataReceived();

  if (updating) valError.validateInteger(payload.id, "id");

  const { email, lastname, firstname, phone } = payload;

  // Required
  if (validator.isEmpty(lastname)) throw new valError.Required("lastname");
  if (validator.isEmpty(firstname)) throw new valError.Required("firstname");
  if (validator.isEmpty(phone) && validator.isEmpty(email))
    throw new valError.Required("Either email or phone");
  if (!validator.isEmpty(phone)) {
    if (!validator.isLength(phone, { min: 1, max: 20 }))
      throw new valError.InvalidLength("phone", 0, 20);

    //if (!validator.isMobilePhone(phone)) throw new valError.InvalidEmail("phone");
    validator.trim(phone);
  }
  // Lengths
  if (!validator.isLength(lastname, { min: 1, max: 60 }))
    throw new valError.InvalidLength("lastname", 0, 60);
  if (!validator.isLength(firstname, { min: 1, max: 60 }))
    throw new valError.InvalidLength("firstname", 0, 60);
  if (!validator.isEmpty(email)) {
    if (!svalidator.isLength(email, { min: 1, max: 60 }))
      throw new valError.InvalidLength("email", 0, 60);
    if (!validator.isEmail(email)) throw new valError.InvalidEmail("email");
    validator.trim(email);
  }
  //=========== Sanitize ===========
  validator.trim(lastname);
  validator.trim(firstname);
}
