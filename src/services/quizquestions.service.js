import { BaseEntityService } from "./baseentity.service";

export default class QuizQuestionService extends BaseEntityService {
  constructor() {
    super("quizquestions");
  }

  async getByQuizIds(quizIds) {
    if (!quizIds || quizIds.length == 0) return null;

    return await this.connector
      .table(this.tableName)
      .whereIn("quizId", quizIds)
      .andWhereNot({ disabled: true })
      .select(
        "id",
        "question",
        "timeLimit",
        "quizId",
        "correctOptions",
        "option1",
        "option2",
        "option3",
        "option4"
      );
  }
}
