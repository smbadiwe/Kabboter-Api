import { BaseEntityService } from "./baseentity.service";
import { SurveyRunService, SurveyQuestionService } from "./";
import { RequestError } from "../utils/ValidationErrors";
import log from "../utils/log";

export default class SurveyAnswerService extends BaseEntityService {
  constructor() {
    super("surveyanswers");
  }

  /**
   * Get the number of surveys this user has participated in.
   * @param {*} uid
   */
  async getUserSurveyParticipationCount(uid) {
    const countQuery = `
select count(*) as total from (
  select q.surveyRunId from surveyanswers q
  where q.userId = ?
  group by q.surveyRunId
  ) as a;`;
    const result = await this.runSqlSelectQuery(countQuery, [uid]);
    log.debug("getUserSurveyParticipationCount - count = %o", result);
    return result[0].total;
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
    const surveyRun = await new SurveyRunService().getFirst({
      pin: record.pin
    });
    if (!surveyRun) throw new RequestError("Invalid game code");

    const existing = this.getFirst({
      surveyId: record.surveyId,
      surveyQuestionId: record.surveyQuestionId,
      surveyRunId: surveyRun.id,
      userId: record.userId
    });
    if (existing && existing.length) {
      existing.choice = record.choice;

      await super.update(existing);
    } else {
      const newRecord = {
        surveyId: record.surveyId,
        surveyQuestionId: record.surveyQuestionId,
        surveyRunId: surveyRun.id,
        userId: record.userId,
        choice: record.choice
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
