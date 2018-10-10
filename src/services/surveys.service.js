import { BaseEntityService } from "./baseentity.service";
import { SurveyQuestionService, SurveyRunService } from ".";
import Enums from "./enums";
import log from "../utils/log";
import { RequestError } from "../utils/ValidationErrors";
import { EventType } from "./AuditLogListener";

export default class SurveyService extends BaseEntityService {
  constructor() {
    super("surveys");
    log.setNamespace("SurveyService");
  }

  /**
   *
   * @param {*} queryParams Example: {title: '', userId: 0, page: 1, perPage: 10 }
   */
  async getRecordsPaged(queryParams) {
    const query = this.connector
      .table(this.tableName + " as q")
      .leftJoin("surveyquestions as qq", "q.id", "=", "qq.surveyId")
      .groupBy("qq.surveyId")
      .modify(queryBuilder => {
        if (queryParams.userId) {
          queryBuilder.where("userId", queryParams.userId);
        }
        if (queryParams.title) {
          queryBuilder.where("q.title", "like", `%${queryParams.title}%`);
        }
      })
      .select([
        "q.id",
        "q.created_at",
        "q.title",
        "q.description",
        this.connector.raw("COUNT(qq.surveyId) as nQuestions"),
        "q.published",
        "q.disabled",
        "q.visibleTo"
      ]);
    return await this.dbPaging(query, { page: queryParams.page, perPage: queryParams.perPage });
  }

  async deleteRecord(id, requestObject) {
    const hasRun = await new SurveyRunService().hasSurveyBeenRun(id);
    if (hasRun)
      throw new RequestError(
        "The survey you want to delete has been played and the scores exist. You can no longer delete it."
      );

    //TODO: Put in one db transaction
    await new SurveyQuestionService().deletePermanently(
      {
        surveyId: id
      },
      requestObject
    );
    await super.deleteRecord(id, requestObject);
  }

  /**
   * Create survey and return the id or the newly-created record.
   * @param {*} requestObject
   */
  async create(requestObject) {
    const payload = requestObject.body;
    const existing = await this.getFirst({ title: payload.title });
    if (existing) throw new RequestError(`A survey with the title ${payload.title} already exists`);

    const userId = requestObject.user.id;
    const survey = {
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };
    const res = await this.save(survey, requestObject);
    return { id: res }; // the id of the newly saved record
  }

  /**
   * Create survey and return the id or the newly-created record.
   * @param {*} requestObject
   */
  async createBatch(requestObject) {
    const userId = requestObject.user.id;
    const payload = requestObject.body;
    const existing = await this.getFirst({ title: payload.title });
    if (existing) throw new RequestError(`A survey with the title ${payload.title} already exists`);

    const survey = {
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };

    //TODO: Put all these in one db transaction
    const surveyId = await this.save(survey, requestObject);

    const questionList = [];
    payload.questions.forEach(q => {
      const qn = {
        question: q.question,
        timeLimit: q.timeLimit,
        surveyId: surveyId,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        introLink: q.introLink,
        creditResources: q.creditResources
      };
      questionList.push(qn);
    });

    await new SurveyQuestionService().saveList(questionList, requestObject);

    return { id: surveyId, nQuestions: questionList.length }; // the id of the newly saved record
  }

  async update(requestObject) {
    const payload = requestObject.body;
    const existing = await this.getFirst({ title: payload.title });
    if (existing && existing.id !== payload.id)
      throw new RequestError(`A survey with the title ${payload.title} already exists`);

    const survey = {
      id: payload.id,
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources
    };
    await super.update(survey, requestObject);
  }

  async publish(requestObject) {
    const id = +requestObject.body.id;
    await super.update({ id: id, published: true }, requestObject, EventType.Publish);
    return { id: id };
  }

  async unpublish(requestObject) {
    const id = +requestObject.body.id;
    await super.update({ id: id, published: false }, requestObject, EventType.Unpublish);
    return { id: id };
  }

  /**
   * Returns the number of surveys set up by the user with the given id
   * @param {*} userId
   */
  async getUserSurveyCount(userId) {
    return await this.getCount({ userId: userId });
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
      .andWhereNot({ disabled: true })
      .select(
        "id",
        "title",
        "description",
        "audience",
        "visibleTo",
        "published",
        "userId",
        "introLink",
        "creditResources"
      );
    if (surveys) {
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
      return surveys;
    }

    return null;
  }
}
