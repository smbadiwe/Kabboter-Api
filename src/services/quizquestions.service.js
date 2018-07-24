import { BaseEntityService } from "./baseentity.service";
import { QuizService, QuizAnswerService } from ".";
import { RequestError, Required } from "../utils/ValidationErrors";
import log from "../utils/log";

export default class QuizQuestionService extends BaseEntityService {
  constructor() {
    super("quizquestions");
    log.setNamespace("QuizQuestionService");
  }

  async getTotalQuizQuestions(quizId) {
    return await this.getCount({ quizId: quizId });
  }

  /**
   * Save quiz question
   * @param {*} requestObject
   */
  async save(requestObject) {
    const payload = requestObject.body;
    const quiz = await new QuizService().getById(payload.quizId);
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
      points: payload.points,
      maxBonus: payload.maxBonus,
      introLink: payload.introLink,
      creditResources: payload.creditResources
    };
    const res = await super.save(quizQn, requestObject);
    return { id: res, points: payload.points, maxBonus: payload.maxBonus }; // the id of the newly saved record
  }

  async daleteRecord(id, requestObject) {
    const answered = await new QuizAnswerService().hasQuizQuestionBeenAnswered(id);
    if (answered)
      throw new RequestError(
        "The quiz question you want to delete has been answered and the scores exist. You can no longer delete it."
      );

    await super.deleteRecord(id, requestObject);
  }

  /**
   * Update quiz question
   * @param {*} requestObject
   */
  async update(requestObject) {
    const record = requestObject.body;
    const quiz = await new QuizService().getById(record.quizId);
    if (!quiz) throw new RequestError("Invalid quiz id");

    const quizQn = {
      id: record.id,
      question: record.question,
      timeLimit: record.timeLimit,
      quizId: record.quizId,
      option1: record.option1,
      option2: record.option2,
      option3: record.option3,
      option4: record.option4,
      correctOptions: record.correctOptions,
      points: record.points,
      maxBonus: record.maxBonus,
      introLink: record.introLink,
      creditResources: record.creditResources
    };
    await super.update(quizQn, requestObject);
  }

  async getBy(equalityConditions) {
    if (equalityConditions)
      return await this.connector
        .table(this.tableName)
        .where(equalityConditions)
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
          "option4",
          "maxBonus",
          "points",
          "introLink",
          "creditResources"
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
        "option4",
        "maxBonus",
        "points",
        "introLink",
        "creditResources"
      );
  }

  async getOneUnansweredQuestion(quizId, answeredQuestionIds) {
    if (!quizId) throw new Required("quizId");
    const unanswered = await this.connector
      .table(this.tableName)
      .where({ quizId: quizId })
      .andWhereNot({ disabled: true })
      .modify(queryBuilder => {
        if (answeredQuestionIds && answeredQuestionIds.length > 0) {
          queryBuilder.whereNotIn("id", answeredQuestionIds);
        }
      })
      .first(
        "id",
        "question",
        "timeLimit",
        "quizId",
        "correctOptions",
        "option1",
        "option2",
        "option3",
        "option4",
        "maxBonus",
        "points",
        "introLink",
        "creditResources"
      );

    return unanswered;
  }
}
