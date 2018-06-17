import { BaseEntityService } from "./baseentity.service";

export default class UserPasswordService extends BaseEntityService {
  constructor() {
    super("userpasswords");
  }

  async getCurrentPassword(userId) {
    return await this.connector
      .table(this.tableName)
      .where({ userId: userId })
      .orderBy("passwordsetdate", "desc")
      .first();
  }
}
