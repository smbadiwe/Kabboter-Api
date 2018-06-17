import { BaseEntityService } from "./baseentity.service";

export default class PermissionService extends BaseEntityService {
  constructor() {
    super("permissions");
  }

  async getByName(name) {
    return await this.connector
      .table(this.tableName)
      .where({ name: name })
      .first();
  }
}
