import validator from "validator";

import {
  validateInteger,
  Required,
  RequestError,
  NoDataReceived,
  ValidationError
} from "../../utils/ValidationErrors";
import { isArray, isObject } from "../../utils";
import { validateSurveyQuestionProps } from "./surveyquestions.validate";

export function validateSurveyProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) validateInteger(payload.id, "id");

  if (!payload.title) throw new Required("title");
  if (payload.introLink && !validator.isURL(payload.introLink))
    throw new RequestError("Invalid URL provided for introLink");
}

export function validateSurveyBatchCreateProps(payload) {
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
    q.surveyId = 0;
    validateSurveyQuestionProps(q);
  });
}
