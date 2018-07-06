import { BaseEntityService } from "./baseentity.service";
import { QuizService, QuizQuestionService, QuizAnswerService } from "./";
import { generatePin } from "../utils";
import log from "../utils/log";
import { RequestError, Required } from "../utils/ValidationErrors";

export default class QuizRunService extends BaseEntityService {
  constructor() {
    super("quizruns");
    log.setNamespace("QuizRunService");
  }

  async getNextQuestionToBeAnswered(quizRunId, quizId, answeredQuestionIds) {
    if (!quizRunId) throw new Required("quizRunId");
    if (!quizId) throw new Required("quizId");
    const quizQns = await new QuizQuestionService().getBy({
      quizId: quizId
    });
    if (!quizQns) throw new RequestError("404 - No questions under the given quiz.");

    const question = await new QuizAnswerService().getOneUnansweredQuestionInQuiz(
      quizRunId,
      quizId,
      quizQns.map(q => q.id)
    );

    log.debug("getNextQuestionToBeAnswered - question = %o", question);
    // if (!question) throw new RequestError("404 - No more pending questions for this quiz", 404);
    // Null means there is no more question to answer.
    return question;
  }

  /**
   * Returns { id: <the quizRun id>, quizId: quizId, pin: pin, totalQuestions: totalQuestions };
   * @param {*} record
   */
  async save(record) {
    log.debug("Getting quiz by quizId");
    const quiz = await new QuizService().getById(record.quizId);
    log.debug("Done getting quiz by quizId");
    if (!quiz) throw new RequestError("Invalid quiz id");

    let pin;
    let exist;
    do {
      pin = generatePin();
      exist = await this.getFirst({ pin: pin });
    } while (exist);

    const totalQuestions = await new QuizQuestionService().getTotalQuizQuestions(record.quizId);
    const quizRun = {
      quizId: record.quizId,
      quiztitle: quiz.title,
      quizdescription: quiz.description,
      pin: pin,
      randomizeQuestions: record.randomizeQuestions,
      randomizeAnswers: record.randomizeAnswers,
      displayPin: record.displayPin,
      totalQuestions: totalQuestions,
      awardPoints: record.awardPoints,
      awardBonus: record.awardBonus
    };

    const res = await super.save(quizRun);

    return {
      gameRunId: res,
      gameId: record.quizId,
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
