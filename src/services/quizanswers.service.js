import { BaseEntityService } from "./baseentity.service";
import { QuizRunService, QuizQuestionService } from "./";
import { RequestError } from "../utils/ValidationErrors";
import log from "../utils/log";

export default class QuizAnswerService extends BaseEntityService {
  constructor() {
    super("quizanswers");
    log.setNamespace("QuizAnswerService");
  }

  /**
   * Get the number of surveys this user has participated in.
   * @param {*} uid
   */
  async getUserQuizParticipationCount(uid) {
    const countQuery = `
select count(*) as total from (
  select q.quizRunId from quizanswers q
  where q.userId = ?
  group by q.quizRunId
  ) as a;`;
    const result = await this.runSqlSelectQuery(countQuery, [uid]);
    log.debug("getUserQuizParticipationCount - count = %o", result);
    return result.total;
  }

  async getOneUnansweredQuestionInQuiz(quizRunId, quizId, quizQuestionIds) {
    log.debug("getOneUnansweredQuestionInQuiz - params = %o", {
      quizId: quizId,
      quizRunId: quizRunId,
      quizQuestionIds: quizQuestionIds
    });
    const answeredQuestions = await this.connector
      .table(this.tableName)
      .select("quizQuestionId")
      .where({ quizId: quizId, quizRunId: quizRunId })
      .groupBy("quizQuestionId")
      .havingIn("quizQuestionId", quizQuestionIds);

    log.debug("getOneUnansweredQuestionInQuiz - count = %o", answeredQuestions);
    if (!answeredQuestions || answeredQuestions.length === 0) {
      return await new QuizQuestionService().getById(quizQuestionIds[0]);
    }

    // for each item in array
    for (const qnId of quizQuestionIds) {
      if (answeredQuestions.indexOf(qnId) < 0) {
        return await new QuizQuestionService().getById(qnId);
      }
    }
    return null;
  }

  /**
   * Save quiz answer. If user has answered this quiz before, we update the record.
   * @param {*} record
   */
  async save(record) {
    log.debug(`save: record: %O`, record);
    const quizRun = await new QuizRunService().getFirst({
      pin: record.pin
    });
    if (!quizRun) throw new RequestError("Invalid PIN");

    log.debug(`save: quizRun record: %O`, quizRun);
    const existing = await this.getFirst({
      quizId: record.quizId,
      quizQuestionId: record.quizQuestionId,
      quizRunId: quizRun.id,
      userId: record.userId
    });
    if (existing) {
      existing.choice = record.choice;
      existing.correct = record.correct;
      existing.points = record.points;
      existing.bonus = record.bonus;

      log.debug(`save: existing record being updated: %O`, existing);
      await super.update(existing);
    } else {
      const newRecord = {
        quizId: record.quizId,
        quizQuestionId: record.quizQuestionId,
        quizRunId: quizRun.id,
        userId: record.userId,
        choice: record.choice,
        correct: record.correct,
        points: record.points,
        bonus: record.bonus
      };
      log.debug(`save: new record being saved: %O`, newRecord);
      await super.save(newRecord);
    }
  }

  async hasQuizQuestionBeenAnswered(quizQuestionId) {
    const run = await this.connector
      .table(this.tableName)
      .where({ quizQuestionId: quizQuestionId })
      .first();

    if (run) return true;

    return false;
  }
}
