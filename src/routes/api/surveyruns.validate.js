import { validateInteger, NoDataReceived } from "../../utils/ValidationErrors";
export { validateInteger };

export function validateSurveyRunProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) validateInteger(payload.id, "id");

  validateInteger(payload.surveyId, "surveyId");
}

export function validateSurveyAnswerProps(payload) {
  if (!payload) throw new NoDataReceived();
  validateInteger(payload.id, "id");

  validateInteger(payload.surveyId, "surveyId");
  validateInteger(payload.surveyQuestionId, "surveyQuestionId");
  validateInteger(payload.choice, "choice");
  validateInteger(payload.surveyId, "surveyId");
}
