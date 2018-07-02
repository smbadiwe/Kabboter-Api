import validator from "validator";

import {
  validateInteger,
  Required,
  RequestError,
  NoDataReceived
} from "../../utils/ValidationErrors";
import { isArray } from "../../utils";
import { validateQuizQuestionProps } from "./quizquestions.validate";

export function validateQuizProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) {
    validateInteger(payload.id, "id");
    payload.id = +payload.id;
  }
  if (!payload.title) throw new Required("title");
  if (payload.introLink && !validator.isURL(payload.introLink))
    throw new RequestError("Invalid URL provided for introLink");
}

export function validateQuizBatchCreateProps(payload) {
  if (!payload) throw new NoDataReceived();

  if (!payload.title) throw new Required("title");
  if (payload.introLink && !validator.isURL(payload.introLink))
    throw new RequestError("Invalid URL provided for introLink");

  if (!payload.questions) throw new Required("questions");
  if (!isArray(payload.questions))
    throw new ValidationError("We're expection 'questions' to be a list");

  if (payload.questions.length === 0)
    throw new ValidationError("You need to send at least one entry 'questions' list");

  payload.questions.forEach(q => {
    q.quizId = 0;
    validateQuizQuestionProps(q);
  });
}
