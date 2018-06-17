import { BaseEntityService } from "./baseentity.service";

export default class EmailAccountService extends BaseEntityService {
  constructor() {
    super("emailaccounts");
  }

  async getDefaultAccount() {
    return await this.connector
      .table(this.tableName)
      .where({ isDefault: true })
      .first();
  }
}
