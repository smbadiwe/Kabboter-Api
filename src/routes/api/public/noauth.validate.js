import validator from "validator";
import {
  validateInteger,
  RequestError,
  Required,
  NoDataReceived,
  ValidationError
} from "../../../utils/ValidationErrors";

export function validateResetPassword(payload) {
  if (!payload) throw new NoDataReceived();
  const { username, password } = payload;
  if (!username) throw new Required("username");
  if (!password) throw new Required("password");
}

export function validateLogin(payload) {
  if (!payload) throw new NoDataReceived();
  const { username, password, rememberme } = payload;
  if (!username) throw new Required("username");
  if (!password) throw new Required("password");
}

export function validatePlayerRegistration(payload) {
  if (!payload) throw new NoDataReceived();
  if (!payload.username) {
    if (!payload.lastname) {
      throw new RequestError("Last name not set.");
    }
    if (!payload.firstname) {
      throw new RequestError("First name not set.");
    }
    if (!payload.email && !payload.phone) {
      throw new RequestError(
        "We need at least one way to contact you. So give us either email address or phone number"
      );
    }
  }

  if (payload.email && !validator.isEmail(payload.email)) {
    throw new ValidationError("Invalid email address");
  }

  if (payload.phone) {
    if (payload.phone.length < 10 || payload.phone.length > 14)
      throw new ValidationError("Invalid number of characters for phone number.");

    if (!validator.isMobilePhone(payload.phone, "en-NG"))
      throw new ValidationError("Invalid phone number");
  }
}

export function validateUserRegistration(payload) {
  if (!payload) throw new NoDataReceived();
  if (!payload.securityquestion) throw new Required("securityquestion");
  if (!payload.securityanswer) throw new Required("securityanswer");
  if (!payload.firstname) throw new Required("firstname");
  if (!payload.lastname) throw new Required("lastname");
  if (!payload.password) throw new Required("password");
  if (!payload.email && !payload.phone) {
    throw new ValidationError(
      "We need a way to contact you. Provide phone number or email address"
    );
  }

  if (payload.email && !validator.isEmail(payload.email)) {
    throw new ValidationError("Invalid email address");
  }

  if (payload.phone) {
    if (payload.phone.length < 10 || payload.phone.length > 14)
      throw new ValidationError("Invalid number of characters for phone number.");

    if (!validator.isMobilePhone(payload.phone, "en-NG"))
      throw new ValidationError("Invalid phone number");
  }
}
