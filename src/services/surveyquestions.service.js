import { BaseEntityService } from "./baseentity.service";
import { SurveyService, SurveyAnswerService } from "./";
import { RequestError } from "../utils/ValidationErrors";

export default class SurveyQuestionService extends BaseEntityService {
  constructor() {
    super("surveyquestions");
  }

  /**
   * Save survey question
   * @param {*} payload
   */
  async save(payload) {
    const survey = await new SurveyService().getById(payload.surveyId);
    if (!survey) throw new RequestError("Invalid survey id");

    const surveyQn = {
      question: payload.question,
      timeLimit: payload.timeLimit,
      surveyId: payload.surveyId,
      option1: payload.option1,
      option2: payload.option2,
      option3: payload.option3,
      option4: payload.option4,
      // correctOptions: payload.correctOptions,
      // points: payload.points,
      // maxBonus: payload.maxBonus,
      introLink: payload.introLink,
      creditResources: payload.creditResources
    };
    const res = await super.save(surveyQn);
    return { id: res, question: payload.question, timeLimit: payload.timeLimit }; // the id of the newly saved record
  }

  /**
   * Update survey question
   * @param {*} record
   */
  async update(record) {
    const survey = await new SurveyService().getById(record.surveyId);
    if (!survey) throw new RequestError("Invalid survey id");

    const surveyQn = {
      id: record.id,
      question: record.question,
      timeLimit: record.timeLimit,
      surveyId: record.surveyId,
      option1: record.option1,
      option2: record.option2,
      option3: record.option3,
      option4: record.option4,
      // correctOptions: record.correctOptions,
      // points: record.points,
      // maxBonus: record.maxBonus,
      introLink: record.introLink,
      creditResources: record.creditResources
    };
    await super.update(surveyQn);
  }

  async daleteRecord(id) {
    const answered = await new SurveyAnswerService().hasSurveyQuestionBeenAnswered(id);
    if (answered)
      throw new RequestError(
        "The survey question you want to delete has been answered and the records exist. You can no longer delete it."
      );

    await super.deleteRecord(id);
  }

  async getTotalSurveyQuestions(surveyId) {
    const totalQuestions = await this.connector
      .table(this.tableName)
      .where({ surveyId: surveyId })
      .count("*");

    return totalQuestions;
  }

  async getBySurveyIds(surveyIds) {
    if (!surveyIds || surveyIds.length == 0) return null;

    return await this.connector
      .table(this.tableName)
      .whereIn("surveyId", surveyIds)
      .andWhereNot({ disabled: true })
      .select(
        "id",
        "question",
        "timeLimit",
        "surveyId",
        "option1",
        "option2",
        "option3",
        "option4",
        "introLink",
        "creditResources"
      );
  }
}
