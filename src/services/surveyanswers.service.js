import { BaseEntityService } from "./baseentity.service";
import { SurveyRunService, SurveyQuestionService } from "./";
import { RequestError } from "../utils/ValidationErrors";

export default class SurveyAnswerService extends BaseEntityService {
  constructor() {
    super("surveyanswers");
  }

  async getOneUnansweredQuestionInSurvey(surveyRunId, surveyId, surveyQuestionIds) {
    const answeredQuestions = await this.connector
      .table(this.tableName)
      .select("surveyQuestionId")
      .where({ surveyId: surveyId, surveyRunId: surveyRunId })
      .groupBy("surveyQuestionId")
      .havingIn("surveyQuestionId", surveyQuestionIds);

    if (!answeredQuestions || answeredQuestions.length === 0) {
      return await new SurveyQuestionService().getById(surveyQuestionIds[0]);
    }

    // for each item in array
    for (const qnId of surveyQuestionIds) {
      if (answeredQuestions.indexOf(qnId) < 0) {
        return await new SurveyQuestionService().getById(qnId);
      }
    }
    return null;
  }

  /**
   * Save survey answer. If user has answered this survey before, we update the record.
   * @param {*} record
   */

  async save(record) {
    const surveyRun = await new SurveyRunService().getBy({
      pin: record.pin
    });
    if (!surveyRun) throw new RequestError("Invalid PIN");

    const existing = this.getBy({
      surveyId: record.surveyId,
      surveyQuestionId: record.surveyQuestionId,
      surveyRunId: surveyRun.id,
      userId: record.userId
    });
    if (existing && existing.length) {
      existing[0].choice = record.choice;
      existing[0].correct = record.correct;
      existing[0].points = record.points;
      existing[0].bonus = record.bonus;

      await super.update(existing[0]);
    } else {
      const newRecord = {
        surveyId: record.surveyId,
        surveyQuestionId: record.surveyQuestionId,
        surveyRunId: record.surveyRunId,
        userId: record.userId,
        choice: record.choice,
        correct: record.correct,
        points: record.points,
        bonus: record.bonus
      };
      await super.save(newRecord);
    }
  }

  async hasSurveyQuestionBeenAnswered(surveyQuestionId) {
    const run = await this.connector
      .table(this.tableName)
      .where({ surveyQuestionId: surveyQuestionId })
      .first();

    if (run) return true;

    return false;
  }
}
