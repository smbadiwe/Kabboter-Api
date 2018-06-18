import { BaseEntityService } from "./baseentity.service";
import { SurveyQuestionService } from "./";
import log from "../utils/log";

export default class SurveyService extends BaseEntityService {
  constructor() {
    super("surveys");
    log.setNamespace("SurveyService");
  }

  /**
   * Returns the number of surveys set up by the user with the given id
   * @param {*} userId
   */
  async getUserSurveyCount(userId) {
    const surveyCount = await this.connector
      .table(this.tableName)
      .where({ userId: userId })
      .andWhereNot({ disabled: true })
      .count({ total: ["*"] });

    return surveyCount[0].total;
  }

  async getByUserId(userId) {
    log.debug("count:");
    log.debug(count);
    log.debug("Running surveyservice.getByUserId with id = %d", userId);
    const surveys = await this.connector
      .table(this.tableName)
      .where({ userId: userId })
      .andWhereNot({ disabled: true });
    if (surveys) {
      log.debug("surveys from db");
      log.debug(surveys);

      const qIds = surveys.map(q => q.id);
      const questions = await new SurveyQuestionService().getBySurveyIds(qIds);

      const surveysDict = {};
      surveys.forEach(q => {
        surveysDict[q.id] = q;
      });
      if (questions) {
        // const questionsBySurveyId = questions.reduce(
        //   (entryMap, e) => entryMap.set(e.surveyId, [...(entryMap.get(e.surveyId) || []), e]),
        //   new Map()
        // );
        const questionsBySurveyId = questions.reduce((entryMap, e) => {
          entryMap[e.surveyId] = entryMap[e.surveyId] || [];
          entryMap[e.surveyId].push(e);
          return entryMap;
        }, Object.create(null));
        for (const qn in questionsBySurveyId) {
          surveysDict[qn].questions = questionsBySurveyId[qn];
        }
      }
      log.debug("surveys with their questions");
      log.debug(surveysDict);
      return surveysDict;
    }

    return null;
  }
}
