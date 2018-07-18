import { BaseEntityService } from "./baseentity.service";

export default class AuditTrailService extends BaseEntityService {
  constructor() {
    super("audittrails");
  }
}
