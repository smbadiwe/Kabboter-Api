import { BaseEntityService } from "./baseentity.service";

export default class SurveyQuestionService extends BaseEntityService {
  constructor() {
    super("surveyquestions");
  }

  async getBySurveyIds(surveyIds) {
    if (!surveyIds || surveyIds.length == 0) return null;

    return await this.connector
      .table(this.tableName)
      .whereIn("surveyId", surveyIds)
      .andWhereNot({ disabled: true })
      .select(
        "id",
        "question",
        "timeLimit",
        "surveyId",
        "option1",
        "option2",
        "option3",
        "option4",
        "introLink",
        "creditResources"
      );
  }
}
