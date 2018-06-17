import { BaseEntityService } from "./baseentity.service";
import { QuizQuestionService } from "./";
import log from "../utils/log";
export default class QuizService extends BaseEntityService {
  constructor() {
    super("quizzes");
    log.setNamespace("QuizService");
  }

  async getByUserId(userId) {
    log.debug("Running quizservice.getByUserId with id = %d", userId);
    const quizzes = await this.connector
      .table(this.tableName)
      .where({ userId: userId })
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
