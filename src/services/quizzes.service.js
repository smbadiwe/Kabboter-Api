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

  async deleteRecord(id) {
    const hasRun = await new QuizRunService().hasQuizBeenRun(id);
    if (hasRun)
      throw new RequestError(
        "The quiz you want to delete has been played and the scores exist. You can no longer delete it."
      );

    await new QuizQuestionService().deletePermanently({ quizId: id });
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
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };
    const res = await this.save(quiz);
    return { id: res }; // the id of the newly saved record
  }

  /**
   * Create survey and return the id or the newly-created record.
   * @param {*} userId
   * @param {*} payload
   */
  async createBatch(userId, payload) {
    const quiz = {
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources,
      userId: userId
    };
    const quizId = await this.save(quiz);

    const questionList = [];
    payload.questions.forEach(q => {
      const qn = {
        question: q.question,
        timeLimit: q.timeLimit,
        quizId: quizId,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correctOptions: q.correctOptions,
        points: q.points,
        maxBonus: q.maxBonus,
        introLink: q.introLink,
        creditResources: q.creditResources
      };
      questionList.push(qn);
    });

    await new QuizQuestionService().saveList(questionList);

    return { id: quizId, nQuestions: questionList.length }; // the id of the newly saved record
  }

  async update(payload) {
    const quiz = {
      id: payload.id,
      title: payload.title,
      description: payload.description,
      audience: payload.audience || Enums.Audience.Social,
      introLink: payload.introLink,
      visibleTo: payload.visibleTo || Enums.VisibleTo.Everyone,
      creditResources: payload.creditResources
    };
    await super.update(quiz);
  }

  /**
   * Returns the number of quizzes set up by the user with the given id
   * @param {*} userId
   */
  async getUserQuizCount(userId) {
    return await this.getCount({ userId: userId });
  }

  async getByUserId(userId, doNotGetQuestions = false) {
    if (!userId) return null;

    return await this.getBy({ userId: userId }, doNotGetQuestions);
  }

  async getBy(equalityConditions, doNotGetQuestions = false) {
    if (!equalityConditions) return null;

    log.debug("Running quizservice.getBy with condition = %o", equalityConditions);
    const quizzes = await this.connector
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
    if (quizzes) {
      log.debug("quizzes from db");
      log.debug(quizzes);

      if (doNotGetQuestions) {
        return quizzes;
      }

      // Now we're getting questions
      const qIds = quizzes.map(q => q.id);
      const questions = await new QuizQuestionService().getByQuizIds(qIds);
      if (!questions) {
        return quizzes;
      }

      // Now there are questions
      const quizzesDict = {};
      quizzes.forEach(q => {
        quizzesDict[q.id] = q;
      });
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

      quizzes.length = 0; // clear the array
      for (const qn in quizzesDict) {
        quizzes.push(quizzesDict[qn]);
      }
      log.debug("quizzes with their questions");
      log.debug(quizzes);
      return quizzes;
    }

    return null;
  }
}
