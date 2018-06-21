import { BaseEntityService } from "./baseentity.service";
import { SurveyQuestionService, SurveyRunService } from "./";
import Enums from "./enums";
import log from "../utils/log";
import { RequestError } from "../utils/ValidationErrors";
export default class SurveyService extends BaseEntityService {
  constructor() {
    super("surveys");
    log.setNamespace("SurveyService");
  }

  async deleteRecord(id) {
    const hasRun = await new SurveyRunService().hasSurveyBeenRun(id);
    if (hasRun)
      throw new RequestError(
        "The survey you want to delete has been played and the scores exist. You can no longer delete it."
      );

    await new SurveyQuestionService().deletePermanently({ surveyId: id });
    await super.deleteRecord(id);
  }

  /**
   * Create survey and return the id or the newly-created record.
   * @param {*} userId
   * @param {*} payload
   */
  async create(userId, payload) {
    const survey = {
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };
    const res = await this.save(survey);
    return { id: res[0] }; // the id of the newly saved record
  }

  async update(payload) {
    const survey = {
      id: payload.id,
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources
    };
    await super.update(survey);
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

  async getByUserId(userId, doNotGetQuestions = false) {
    if (!userId) return null;

    return await this.getBy({ userId: userId }, doNotGetQuestions);
  }

  async getBy(equalityConditions, doNotGetQuestions = false) {
    if (!equalityConditions) return null;

    log.debug("Running surveyservice.getBy with condition = %o", equalityConditions);
    const surveys = await this.connector
      .table(this.tableName)
      .where(equalityConditions)
      .andWhereNot({ disabled: true });
    if (surveys) {
      log.debug("surveys from db");
      log.debug(surveys);

      if (doNotGetQuestions) {
        return surveys;
      }

      // Now we're getting questions
      const qIds = surveys.map(q => q.id);
      const questions = await new SurveyQuestionService().getBySurveyIds(qIds);
      if (!questions) {
        return surveys;
      }

      // Now there are questions
      const surveysDict = {};
      surveys.forEach(q => {
        surveysDict[q.id] = q;
      });
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

      surveys.length = 0; // clear the array
      for (const qn in surveysDict) {
        surveys.push(surveysDict[qn]);
      }
      log.debug("surveys with their questions");
      log.debug(surveys);
      return surveys;
    }

    return null;
  }
}
