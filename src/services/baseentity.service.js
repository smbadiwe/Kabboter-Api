import knex from "../db/connection";
import { isArray, isObject } from "../utils";
import { validateInteger } from "../utils/ValidationErrors";
import * as audit from "./AuditLogListener";

export class BaseEntityService {
  constructor(tableName) {
    this._tableName = tableName;
    this._connector = knex;
  }

  get connector() {
    return this._connector;
  }

  get tableName() {
    return this._tableName;
  }

  /**
   *
   * @param {*} query The Knex query
   * @param {*} pagingInfo { perPage: perPage, page: page, }
   * 
   * @returns The following JSON
   *  { pagination: {
        total: total,
        perPage,
        currentPage: page,
        lastPage: Math.ceil(total / perPage),
        from: offset,
        to: offset + data.length
      },
      data: data // list of the data batch queried
    }
   */
  async dbPaging(query, pagingInfo) {
    const perPage = +(pagingInfo.perPage || 10);
    let page = +(pagingInfo.page || 1);

    const countQuery = knex.count("* as total").from(query.clone().as("inner"));

    if (page < 1) {
      page = 1;
    }
    const offset = (page - 1) * perPage;

    query.offset(offset);

    if (perPage > 0) {
      query.limit(perPage);
    }

    const [data, countRows] = await Promise.all([query, countQuery]);

    const total = countRows[0].total;

    return {
      pagination: {
        total: total,
        perPage,
        currentPage: page,
        lastPage: Math.ceil(total / perPage),
        from: offset + 1,
        to: offset + data.length
      },
      data: data
    };
  }

  /**
   * Use this to run select queries. We return an array of the results, even if it's just one record.
   * @param {*} rawSqlQuery string containing the query, written the way knex wants it. We pass it directly to this.connector.raw (knex.raw) and return the data.
   * @param {*} args The query parameters.
   */
  async runSqlSelectQuery(rawSqlQuery, args) {
    const result = await this.connector.raw(rawSqlQuery, args);
    // See https://github.com/tgriesser/knex/issues/1802 for why the [0]
    return result[0];
  }

  async getAll() {
    return await this.connector.table(this.tableName).select();
  }

  /**
   * If no equality conditions is specified, we return null.
   * Also, all fields must be within the table. No joins.
   * @param {*} equalityConditions
   */
  async getBy(equalityConditions) {
    if (equalityConditions)
      return await this.connector.table(this.tableName).where(equalityConditions);

    return null;
  }

  /**
   * Retrieve the first record that meet the specified equality condition(s).
   * If 'conditions' is falsy, we retrieve the first record in the DB.
   * Also, all fields must be within the table. No joins.
   * @param {*} equalityConditions A JSON object specifying equality conditions the knex way
   */
  async getFirst(equalityConditions = null) {
    if (equalityConditions)
      return await this.connector
        .table(this.tableName)
        .where(equalityConditions)
        .first();

    return await this.connector.table(this.tableName).first();
  }

  async getCount(equalityConditions) {
    let count;
    if (equalityConditions) {
      count = await this.connector
        .table(this.tableName)
        .where(equalityConditions)
        .count({ total: ["*"] });
    } else {
      count = await this.connector.table(this.tableName).count({ total: ["*"] });
    }
    return count[0].total;
  }

  async getById(entityId) {
    validateInteger(entityId, "id", true);
    return await this.connector
      .table(this.tableName)
      .where({ id: entityId })
      .first();
  }

  async getByIds(entityIds) {
    if (!entityIds || entityIds.length == 0) return null;
    entityIds.forEach(id => {
      validateInteger(id, "id", true);
    });
    return await this.connector.table(this.tableName).whereIn("id", entityIds);
  }

  //NB: Unless otherwise stated, I'm using trx as a query builder:

  /**
   * Inserts the supplied record(s) to the table and return the id of the inserted record.
   * @param {*} record An object to be inserted.
   * @param {*} requestData [Optional] the request; will usually be ctx.request
   */
  async save(record, requestData) {
    if (isObject(record)) {
      if ("id" in record) delete record.id;
      const id = await this.connector.transaction(async function(trx) {
        const idd = await trx.table(this.tableName).insert(record, "id");
        const newRecordId = idd[0];
        await audit.onEntityAdded({
          requestData: requestData,
          entityName: this.tableName,
          record: record,
          ids: newRecordId,
          knex: trx
        });

        return newRecordId;
      });

      console.log("save(): id = " + id);
      return id;
    }
  }

  /**
   * Inserts the supplied record(s) to the table and return array of the id(s) of the inserted record.
   * @param {*} records An array of objects to be inserted.
   * @param {*} requestData [Optional] the request; will usually be ctx.request
   */
  async saveList(records, requestData) {
    if (isArray(records)) {
      records.forEach(r => {
        if ("id" in r) delete r.id;
      });

      const ids = await this.connector.transaction(async function(trx) {
        //NB: Here, I'm using trx as a transaction object. We'll explicitly call commit or rollback:
        try {
          const idss = await this.connector
            .transacting(trx)
            .batchInsert(this.tableName, records)
            .returning("id");
          await audit.onEntityListAdded({
            requestData: requestData,
            entityName: this.tableName,
            ids: idss,
            knex: trx
          });
          trx.commit();
          return idss;
        } catch (e) {
          console.log(e);
          trx.rollback();
        }
      });

      console.log("saveList(): ids = ");
      console.log(ids);
      return ids;
    }
  }

  /**
   * Returns the number of records updated
   * @param {*} record
   * @param {*} requestData [Optional] the request; will usually be ctx.request
   */
  async update(record, requestData) {
    if (isObject(record) && record.id > 0) {
      const id = record.id;
      delete record.id;
      try {
        let oldRecord = undefined;
        if (requestData) {
          oldRecord = await this.connector
            .table(this.tableName)
            .where({ id: id })
            .select(Object.keys(record));
        }

        // ADD transaction
        await this.connector.transaction(async function(trx) {
          await trx
            .table(this.tableName)
            .where({ id: id })
            .update(record);

          if (oldRecord && oldRecord.length) {
            await audit.onEntityUpdated({
              requestData: requestData,
              entityName: this.tableName,
              oldRecord: oldRecord[0],
              newRecord: record,
              ids: id,
              knex: trx
            });
          }
        });
      } finally {
        record.id = id;
      }
    } else {
      return await this.save(record);
    }
  }

  async deleteRecord(id, requestData) {
    validateInteger(id, "id", true);
    return await this.deletePermanently({ id: id }, requestData);
  }

  /**
   * Delete all record that match the given equality conditions. E.g. {id: 4 }.
   * All fields must be within the table. No joins.
   * @param {*} equalityConditions
   * @param {*} requestData [Optional] the request; will usually be ctx.request
   */
  async deletePermanently(equalityConditions, requestData) {
    if (isObject(equalityConditions)) {
      let oldRecord = undefined;
      if (requestData) {
        oldRecord = await this.connector
          .table(this.tableName)
          .where(equalityConditions)
          .select(Object.keys(record));
      }

      // ADD transaction
      await this.connector.transaction(async function(trx) {
        await trx
          .table(this.tableName)
          .where(equalityConditions)
          .del();

        if (oldRecord && oldRecord.length) {
          await audit.onEntityDeleted({
            requestData: requestData,
            entityName: this.tableName,
            oldRecord: oldRecord.length === 1 ? oldRecord[0] : oldRecord,
            ids: oldRecord.length === 1 ? oldRecord[0].id : oldRecord.map(x => x.id),
            knex: trx
          });
        }
      });
    }
  }
}
