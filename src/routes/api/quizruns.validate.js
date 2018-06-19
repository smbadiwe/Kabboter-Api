import { validateInteger, NoDataReceived } from "../../utils/ValidationErrors";
export { validateInteger };

export function validateQuizRunProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) validateInteger(payload.id, "id");

  validateInteger(payload.quizId, "quizId");
}

export function validateQuizAnswerProps(payload) {
  if (!payload) throw new NoDataReceived();
  validateInteger(payload.id, "id");

  validateInteger(payload.quizId, "quizId");
  validateInteger(payload.quizQuestionId, "quizQuestionId");
  validateInteger(payload.choice, "choice");
  validateInteger(payload.quizId, "quizId");
}
