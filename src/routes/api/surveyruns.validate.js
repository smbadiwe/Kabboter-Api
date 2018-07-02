import { validateInteger, NoDataReceived } from "../../utils/ValidationErrors";
export { validateInteger };

export function validateSurveyRunProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) {
    validateInteger(payload.id, "id");
    payload.id = +payload.id;
  }
  validateInteger(payload.surveyId, "surveyId");
  payload.surveyId = +payload.surveyId;
}

export function validateSurveyAnswerProps(payload) {
  if (!payload) throw new NoDataReceived();
  validateInteger(payload.id, "id");
  payload.id = +payload.id;

  validateInteger(payload.surveyId, "surveyId");
  payload.surveyId = +payload.surveyId;
  validateInteger(payload.surveyQuestionId, "surveyQuestionId");
  payload.surveyQuestionId = +payload.surveyQuestionId;
  validateInteger(payload.choice, "choice");
  payload.choice = +payload.choice;
}
