import { BaseEntityService } from "./baseentity.service";

export default class QuizAnswerService extends BaseEntityService {
  constructor() {
    super("quizanswers");
  }

  async hasQuizQuestionBeenAnswered(quizQuestionId) {
    const run = await this.connector
      .table(this.tableName)
      .where({ quizQuestionId: quizQuestionId })
      .first();

    if (run) return true;

    return false;
  }
}
