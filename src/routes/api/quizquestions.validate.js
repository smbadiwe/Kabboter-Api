import {
  validateInteger,
  Required,
  RequestError,
  NoDataReceived
} from "../../utils/ValidationErrors";
export { validateInteger };

export function validateQuizQuestionProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) validateInteger(payload.id, "id");

  validateInteger(payload.quizId, "quizId");
  if (!payload.question) throw new Required("question");
  if (!payload.option1) throw new Required("option1");
  if (!payload.option2) throw new Required("option2");
  if (!payload.correctOptions) throw new Required("correctOptions");
  if (payload.introLink && !validator.isURL(payload.introLink))
    throw new RequestError("Invalid URL provided for introLink");
}
