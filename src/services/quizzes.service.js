import { BaseEntityService } from "./baseentity.service";
import { QuizQuestionService, QuizRunService } from "./";
import Enums from "./enums";
import log from "../utils/log";
import { RequestError } from "../utils/ValidationErrors";
export default class QuizService extends BaseEntityService {
  constructor() {
    super("quizzes");
    log.setNamespace("QuizService");
  }

  async daleteRecord(id) {
    const hasRun = await new QuizRunService().hasQuizBeenRun(id);
    if (hasRun)
      throw new RequestError(
        "The quiz you want to delete has been played and the scores exist. You can no longer delete it."
      );

    await new QuizQuestionService().daletePermanently({ quizId: id });
    await super.deleteRecord(id);
  }

  /**
   * Create quiz and return the id or the newly-created record.
   * @param {*} userId
   * @param {*} payload
   */
  async create(userId, payload) {
    const quiz = {
      title: payload.title,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };
    const res = await this.save(quiz);
    return { id: res[0] }; // the id of the newly saved record
  }

  async edit(payload) {
    const quiz = {
      id: payload.id,
      title: payload.title,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources
    };
    await this.update(quiz);
  }

  /**
   * Returns the number of quizzes set up by the user with the given id
   * @param {*} userId
   */
  async getUserQuizCount(userId) {
    const quizCount = await this.connector
      .table(this.tableName)
      .where({ userId: userId })
      .andWhereNot({ disabled: true })
      .count({ total: ["*"] });

    return quizCount[0].total;
  }

  async getByUserId(userId) {
    if (!userId) return null;

    return this.getBy({ userId: userId });
  }

  async getBy(equalityConditions) {
    if (!equalityConditions) return null;

    log.debug("Running quizservice.getBy with condition = %o", equalityConditions);
    const quizzes = await this.connector
      .table(this.tableName)
      .where(equalityConditions)
      .andWhereNot({ disabled: true });
    if (quizzes) {
      log.debug("quizzes from db");
      log.debug(quizzes);

      const qIds = quizzes.map(q => q.id);
      const questions = await new QuizQuestionService().getByQuizIds(qIds);

      const quizzesDict = {};
      quizzes.forEach(q => {
        quizzesDict[q.id] = q;
      });
      if (questions) {
        // const questionsByQuizId = questions.reduce(
        //   (entryMap, e) => entryMap.set(e.quizId, [...(entryMap.get(e.quizId) || []), e]),
        //   new Map()
        // );
        const questionsByQuizId = questions.reduce((entryMap, e) => {
          entryMap[e.quizId] = entryMap[e.quizId] || [];
          entryMap[e.quizId].push(e);
          return entryMap;
        }, Object.create(null));
        for (const qn in questionsByQuizId) {
          quizzesDict[qn].questions = questionsByQuizId[qn];
        }
      }
      log.debug("quizzes with their questions");
      log.debug(quizzesDict);
      return quizzesDict;
    }

    return null;
  }
}
