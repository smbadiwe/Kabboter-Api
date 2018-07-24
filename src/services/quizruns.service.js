import { BaseEntityService } from "./baseentity.service";
import { QuizService, QuizQuestionService, QuizAnswerService } from ".";
import { generatePin } from "../utils";
import log from "../utils/log";
import { RequestError, Required } from "../utils/ValidationErrors";

export default class QuizRunService extends BaseEntityService {
  constructor() {
    super("quizruns");
    log.setNamespace("QuizRunService");
  }

  async getPlayerTotalScores(quizRunId, limit) {
    const query = `
    SELECT g.quizRunId, g.userId, u.username, u.firstname, u.lastname, SUM(g.points + g.bonus) AS score 
    FROM quizanswers g
    INNER JOIN users u ON u.id = g.userId
    GROUP BY g.quizRunId, g.userId
    HAVING g.quizRunId = ?
    ORDER BY score DESC`;
    return await this.runSqlSelectQuery(query, [quizRunId]);
  }

  /**
   * Returns { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions };
   * @param {*} requestData
   */
  async save(requestData) {
    const record = requestData.body;
    log.debug("Getting quiz by quizId");
    const quiz = await new QuizService().getById(record.gameId);
    log.debug("Done getting quiz by quizId");
    if (!quiz) throw new RequestError("Invalid game id");

    let pin;
    let exist;
    do {
      pin = generatePin();
      exist = await this.getFirst({ pin: pin });
    } while (exist);

    const totalQuestions = await new QuizQuestionService().getTotalQuizQuestions(record.gameId);
    const quizRun = {
      quizId: record.gameId,
      quiztitle: quiz.title,
      quizdescription: quiz.description,
      pin: pin,
      randomizeQuestions: record.randomizeQuestions,
      randomizeAnswers: record.randomizeAnswers,
      displayPin: record.displayPin,
      totalQuestions: totalQuestions,
      awardPoints: record.awardPoints,
      awardBonus: record.awardBonus,
      moderatorId: requestData.user.id
    };

    const res = await super.save(quizRun, requestData);

    return {
      gameRunId: res,
      gameId: record.gameId,
      gametitle: quiz.title,
      gamedescription: quiz.description,
      pin: pin,
      totalQuestions: totalQuestions
    };
  }

  async hasQuizBeenRun(quizId) {
    const run = await this.connector
      .table(this.tableName)
      .where({ quizId: quizId })
      .first();

    if (run) return true;

    return false;
  }
}
