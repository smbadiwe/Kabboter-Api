import { BaseEntityService } from "./baseentity.service";
import { QuizService, QuizQuestionService, QuizAnswerService } from "./";
import { generatePin } from "../utils";
import log from "../utils/log";

export default class QuizRunService extends BaseEntityService {
  constructor() {
    super("quizruns");
    log.setNamespace("QuizRunService");
  }

  async getNextQuestionToBeAnswered(quizRunId, quizId) {
    const quizQns = await new QuizQuestionService().getBy({
      quizId: quizId
    });
    if (!quizQns) throw new RequestError("No questions under the given quiz.");

    const question = await new QuizAnswerService().getOneUnansweredQuestionInQuiz(
      quizRunId,
      quizId,
      quizQns.map(q => q.id)
    );
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
      log.debug("Done getting quiz run by pin: %s. value = %o", pin, exist);
    } while (exist);

    const quizRun = {
      quizId: record.quizId,
      pin: pin,
      randomizeQuestions: record.randomizeQuestions,
      randomizeAnswers: record.randomizeAnswers,
      displayPin: record.displayPin,
      awardPoints: record.awardPoints,
      awardBonus: record.awardBonus
    };

    const res = await super.save(quizRun);

    const totalQuestions = await new QuizQuestionService().getTotalQuizQuestions(record.quizId);
    return { id: res[0], quizId: record.quizId, pin: pin, totalQuestions: totalQuestions }; // the id of the newly saved record
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
