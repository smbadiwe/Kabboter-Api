import { BaseEntityService } from "./baseentity.service";
import { getKeyByValue } from "../utils";
import { EventType } from "./AuditLogListener";
import moment from "moment";

export default class AuditLogService extends BaseEntityService {
  constructor() {
    super("auditlogs");
  }

  async getRecordsPaged(queryParams) {
    console.log("queryParams = ");
    console.log(queryParams);
    const query = this.connector
      .table(this.tableName)
      .modify(queryBuilder => {
        if (queryParams.username) {
          queryBuilder.where("username", queryParams.username);
        }
        if (queryParams.eventType) {
          queryBuilder.where("eventType", queryParams.eventType);
        }
        if (queryParams.dateTo) {
          queryParams.dateTo = new Date(queryParams.dateTo);
        } else {
          queryParams.dateTo = new Date(); // now
        }
        // add one day to the end date
        // this date won't have time component; so we move date to the beginning of the next year.
        // This way, we can get data for all times in a given day, up to 23:59:59
        queryParams.dateTo.setTime(queryParams.dateTo.getTime() + 1 * 86400000);

        if (queryParams.dateFrom) {
          queryParams.dateFrom = new Date(queryParams.dateFrom);
          if (queryParams.dateFrom > queryParams.dateTo) {
            const temp = queryParams.dateFrom;
            queryParams.dateFrom = queryParams.dateTo;
            queryParams.dateTo = temp;
          }
          queryBuilder.whereBetween("created_at", [
            moment(queryParams.dateFrom).format("YYYY-MM-DD"),
            moment(queryParams.dateTo).format("YYYY-MM-DD")
          ]);
        } else {
          queryBuilder.where("created_at", "<", moment(queryParams.dateTo).format("YYYY-MM-DD"));
        }
      })
      .select()
      .orderBy("created_at", "desc");

    let res = await this.dbPaging(query, { page: queryParams.page, perPage: queryParams.perPage });
    console.log(res);
    if (res && res.data) {
      res.data.forEach(val => {
        val.eventType = getKeyByValue(EventType, val.eventType);
        val.created_at = moment(val.created_at).format("YYYY-MM-DD hh:mm:ss A");
      });
    }

    return res;
  }
}
