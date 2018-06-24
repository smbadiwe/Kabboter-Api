import { BaseEntityService } from "./baseentity.service";
import { QuizRunService, QuizQuestionService } from "./";
import { RequestError } from "../utils/ValidationErrors";
import log from "../utils/log";

export default class QuizAnswerService extends BaseEntityService {
  constructor() {
    super("quizanswers");
  }

  /**
   * Get the number of surveys this user has participated in.
   * @param {*} uid
   */
  async getUserQuizParticipationCount(uid) {
    const count = await this.connector.raw(
      `
select count(*) as total from (
  select q.quizRunId from quizanswers q
  where q.userId = ?
  group by q.quizRunId
  ) as a;`,
      [uid]
    );

    log.debug("getUserQuizParticipationCount - count = %o", count);
    return count[0].total;
  }

  async getOneUnansweredQuestionInQuiz(quizRunId, quizId, quizQuestionIds) {
    const answeredQuestions = await this.connector
      .table(this.tableName)
      .select("quizQuestionId")
      .where({ quizId: quizId, quizRunId: quizRunId })
      .groupBy("quizQuestionId")
      .havingIn("quizQuestionId", quizQuestionIds);

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
    const quizRun = await new QuizRunService().getBy({
      pin: record.pin
    });
    if (!quizRun) throw new RequestError("Invalid PIN");

    const existing = this.getBy({
      quizId: record.quizId,
      quizQuestionId: record.quizQuestionId,
      quizRunId: quizRun.id,
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
        quizId: record.quizId,
        quizQuestionId: record.quizQuestionId,
        quizRunId: record.quizRunId,
        userId: record.userId,
        choice: record.choice,
        correct: record.correct,
        points: record.points,
        bonus: record.bonus
      };
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
