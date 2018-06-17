export class RequestError extends Error {
  constructor(message, status = 400) {
    super(`${message || "Request error"}`);

    this.status = status; // bad request

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ValidationError extends RequestError {
  constructor(message) {
    super(`${message || "Invalid value"}`, 400);
  }
}

export class NoDataReceived extends ValidationError {
  constructor() {
    super(`No data received`);
  }
}
export class Required extends ValidationError {
  constructor(param) {
    super(`${param} is required`);
  }
}
export class PositiveNumber extends ValidationError {
  constructor(param) {
    super(`${param} should be a number greater than 0`);
  }
}
export class InvalidEmail extends ValidationError {
  constructor(param) {
    super(`${param} should be a valid email`);
  }
}
export class InvalidLength extends ValidationError {
  constructor(param, min, max) {
    super(`${param} should have between ${min || 0} and ${max || 255} characters.`);
  }
}
export class NonExistentId extends ValidationError {
  constructor(param) {
    super(`The value supplied as ${param} does not belong to any relevant record.`);
  }
}
