import { BaseEntityService } from "./baseentity.service";
import { QuizService, QuizQuestionService, QuizAnswerService } from "./";
import { generatePin } from "../utils";

export default class QuizRunService extends BaseEntityService {
  constructor() {
    super("quizruns");
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
   * Returns { id: <the quizRun id>, quizId: quizId, pin: pin };
   * @param {*} record
   */
  async save(record) {
    const quiz = await new QuizService().getById(record.quizId);
    if (!quiz) throw new RequestError("Invalid quiz id");

    let pin;
    let exist;
    do {
      pin = generatePin();
      exist = await this.getBy({ pin: pin });
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
    return { id: res[0], quizId: quizId, pin: pin }; // the id of the newly saved record
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
