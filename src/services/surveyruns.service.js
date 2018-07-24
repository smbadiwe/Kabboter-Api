import { BaseEntityService } from "./baseentity.service";
import { SurveyService, SurveyQuestionService } from ".";
import { generatePin } from "../utils";

export default class SurveyRunService extends BaseEntityService {
  constructor() {
    super("surveyruns");
  }

  /**
   * Returns { id: <the quizRun id>, surveyId: surveyId, pin: pin, totalQuestions: totalQuestions };
   * @param {*} requestData
   */
  async save(requestData) {
    const record = requestData.body;
    const survey = await new SurveyService().getById(record.surveyId);
    if (!survey) throw new RequestError("Invalid survey id");

    let pin;
    let exist;
    do {
      pin = generatePin();
      exist = await this.getFirst({ pin: pin });
    } while (exist);

    const totalQuestions = await new SurveyQuestionService().getTotalSurveyQuestions(
      record.surveyId
    );
    const surveyRun = {
      surveyId: record.surveyId,
      surveytitle: survey.title,
      surveydescription: survey.description,
      pin: pin,
      randomizeQuestions: record.randomizeQuestions,
      randomizeAnswers: record.randomizeAnswers,
      displayPin: record.displayPin,
      totalQuestions: totalQuestions,
      moderatorId: requestData.user.id
    };

    const res = await super.save(surveyRun, requestData);

    return {
      gameRunId: res,
      gameId: record.surveyId,
      gametitle: survey.title,
      gamedescription: survey.description,
      pin: pin,
      totalQuestions: totalQuestions
    };
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
