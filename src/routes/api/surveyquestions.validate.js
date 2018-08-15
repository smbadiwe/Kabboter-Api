import {
  validateInteger,
  Required,
  RequestError,
  NoDataReceived
} from "../../utils/ValidationErrors";

export function validateSurveyQuestionProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) {
    validateInteger(payload.id, "id");
    payload.id = +payload.id;
  }
  validateInteger(payload.surveyId, "surveyId");
  payload.surveyId = +payload.surveyId;
  if (!payload.points) payload.points = 0;
  if (!payload.maxBonus) payload.maxBonus = 0;
  if (!payload.timeLimit) throw new Required("timeLimit");
  validateInteger(payload.timeLimit, "timeLimit", true);
  payload.timeLimit = +payload.timeLimit;
  validateInteger(payload.points, "points");
  payload.points = +payload.points;
  validateInteger(payload.maxBonus, "maxBonus");
  payload.maxBonus = +payload.maxBonus;
  if (!payload.question) throw new Required("question");
  if (!payload.option1) throw new Required("option1");
  if (!payload.option2) throw new Required("option2");
  if (payload.introLink && !validator.isURL(payload.introLink))
    throw new RequestError("Invalid URL provided for introLink");
}
