import { validateInteger, NoDataReceived } from "../../utils/ValidationErrors";
export { validateInteger };

export function validateQuizRunProps(payload, updating = false) {
  if (!payload) throw new NoDataReceived();
  if (updating) {
    validateInteger(payload.id, "id");
    payload.id = +payload.id;
  }
  validateInteger(payload.quizId, "quizId");
  payload.quizId = +payload.quizId;
}

export function validateQuizAnswerProps(payload) {
  if (!payload) throw new NoDataReceived();
  validateInteger(payload.id, "id");
  payload.id = +payload.id;

  validateInteger(payload.quizId, "quizId");
  payload.quizId = +payload.quizId;
  validateInteger(payload.quizQuestionId, "quizQuestionId");
  payload.quizQuestionId = +payload.quizQuestionId;
  validateInteger(payload.choice, "choice");
  payload.choice = +payload.choice;
}
