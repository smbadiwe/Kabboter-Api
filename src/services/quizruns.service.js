import { BaseEntityService } from "./baseentity.service";

export default class QuizRunService extends BaseEntityService {
  constructor() {
    super("quizruns");
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
