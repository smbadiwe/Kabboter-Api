import { BaseEntityService } from "./baseentity.service";
import { QuizService, QuizAnswerService } from "./";
import { RequestError } from "../utils/ValidationErrors";

export default class QuizQuestionService extends BaseEntityService {
  constructor() {
    super("quizquestions");
  }

  async create(payload) {
    const quiz = new QuizService().getById(payload.quizId);
    if (!quiz) throw new RequestError("Invalid quiz id");

    const quizQn = {
      question: payload.question,
      timeLimit: payload.timeLimit,
      quizId: payload.quizId,
      option1: payload.option1,
      option2: payload.option2,
      option3: payload.option3,
      option4: payload.option4,
      correctOptions: payload.correctOptions,
      introLink: payload.introLink,
      creditResources: payload.creditResources
    };
    const res = await this.save(quizQn);
    return { id: res[0] }; // the id of the newly saved record
  }

  async daleteRecord(id) {
    const answered = await new QuizAnswerService().hasQuizQuestionBeenAnswered(id);
    if (answered)
      throw new RequestError(
        "The quiz question you want to delete has been answered and the scores exist. You can no longer delete it."
      );

    await super.deleteRecord(id);
  }

  async edit(payload) {
    const quiz = new QuizService().getById(payload.quizId);
    if (!quiz) throw new RequestError("Invalid quiz id");

    const quizQn = {
      id: payload.id,
      question: payload.question,
      timeLimit: payload.timeLimit,
      quizId: payload.quizId,
      option1: payload.option1,
      option2: payload.option2,
      option3: payload.option3,
      option4: payload.option4,
      correctOptions: payload.correctOptions,
      introLink: payload.introLink,
      creditResources: payload.creditResources
    };
    await this.update(quizQn);
  }

  async getBy(equalityConditions) {
    if (equalityConditions)
      return await this.connector
        .table(this.tableName)
        .where(equalityConditions)
        .select(
          "id",
          "question",
          "timeLimit",
          "quizId",
          "correctOptions",
          "option1",
          "option2",
          "option3",
          "option4"
        );

    return null;
  }

  async getByQuizIds(quizIds) {
    if (!quizIds || quizIds.length == 0) return null;

    return await this.connector
      .table(this.tableName)
      .whereIn("quizId", quizIds)
      .andWhereNot({ disabled: true })
      .select(
        "id",
        "question",
        "timeLimit",
        "quizId",
        "correctOptions",
        "option1",
        "option2",
        "option3",
        "option4"
      );
  }
}
