import { BaseEntityService } from "./baseentity.service";
import { SurveyService, SurveyQuestionService, SurveyAnswerService } from "./";
import { generatePin } from "../utils";

export default class SurveyRunService extends BaseEntityService {
  constructor() {
    super("surveyruns");
  }

  async getNextQuestionToBeAnswered(surveyRunId, surveyId) {
    const surveyQns = await new SurveyQuestionService().getBy({
      surveyId: surveyId
    });
    if (!surveyQns) throw new RequestError("No questions under the given survey.");

    const question = await new SurveyAnswerService().getOneUnansweredQuestionInSurvey(
      surveyRunId,
      surveyId,
      surveyQns.map(q => q.id)
    );
    return question;
  }

  /**
   * Returns { id: <the quizRun id>, surveyId: surveyId, pin: pin, totalQuestions: totalQuestions };
   * @param {*} record
   */
  async save(record) {
    const survey = await new SurveyService().getById(record.surveyId);
    if (!survey) throw new RequestError("Invalid survey id");

    let pin;
    let exist;
    do {
      pin = generatePin();
      exist = await this.getBy({ pin: pin });
    } while (exist);

    const surveyRun = {
      surveyId: record.surveyId,
      pin: pin,
      randomizeQuestions: record.randomizeQuestions,
      randomizeAnswers: record.randomizeAnswers,
      displayPin: record.displayPin,
      awardPoints: record.awardPoints,
      awardBonus: record.awardBonus
    };

    const res = await super.save(surveyRun);

    const totalQuestions = await new SurveyQuestionService().getTotalSurveyQuestions(
      record.surveyId
    );

    return { id: res[0], surveyId: record.surveyId, pin: pin, totalQuestions: totalQuestions };
  }

  async hasSurveyBeenRun(surveyId) {
    const run = await this.connector
      .table(this.tableName)
      .where({ surveyId: surveyId })
      .first();

    if (run) return true;

    return false;
  }
}
