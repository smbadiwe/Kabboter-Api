import { BaseEntityService } from "./baseentity.service";

export default class ElectionService extends BaseEntityService {
  constructor() {
    super("elections");
  }

  async getByYear(year) {
    return await this.connector
      .table(this.tableName)
      .where({ year: year });
  }
}
