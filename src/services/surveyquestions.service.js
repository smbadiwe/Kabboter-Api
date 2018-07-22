import { BaseEntityService } from "./baseentity.service";
import { SurveyService, SurveyAnswerService } from "./";
import { RequestError, Required } from "../utils/ValidationErrors";

export default class SurveyQuestionService extends BaseEntityService {
  constructor() {
    super("surveyquestions");
  }

  /**
   * Save survey question
   * @param {*} requestObject
   */
  async save(requestObject) {
    const payload = requestObject.body;
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
      introLink: payload.introLink,
      creditResources: payload.creditResources
    };
    const res = await super.save(surveyQn, requestObject);
    return { id: res, question: payload.question, timeLimit: payload.timeLimit }; // the id of the newly saved record
  }

  /**
   * Update survey question
   * @param {*} requestObject
   */
  async update(requestObject) {
    const record = requestObject.body;

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
    await super.update(surveyQn, requestObject);
  }

  async daleteRecord(id, requestObject) {
    const answered = await new SurveyAnswerService().hasSurveyQuestionBeenAnswered(id);
    if (answered)
      throw new RequestError(
        "The survey question you want to delete has been answered and the records exist. You can no longer delete it."
      );

    await super.deleteRecord(id, requestObject);
  }

  async getTotalSurveyQuestions(surveyId) {
    return await this.getCount({ surveyId: surveyId });
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

  async getOneUnansweredQuestion(surveyId, answeredQuestionIds) {
    if (!surveyId) throw new Required("surveyId");
    const unanswered = await this.connector
      .table(this.tableName)
      .where({ surveyId: surveyId })
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
        "surveyId",
        "option1",
        "option2",
        "option3",
        "option4",
        "introLink",
        "creditResources"
      );

    return unanswered;
  }
}
