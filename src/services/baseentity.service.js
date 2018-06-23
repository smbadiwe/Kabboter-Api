import knex from "../db/connection";

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
   * @param {*} options { perPage: perPage, page: page, }
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
  async dbPaging(query, options) {
    const perPage = options.perPage || 10;
    let page = options.page || 1;

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
        from: offset,
        to: offset + data.length
      },
      data: data
    };
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
    }

    count = await this.connector.table(this.tableName).count({ total: ["*"] });
    return count[0].total;
  }

  async getById(entityId) {
    if (!entityId) return null;
    return await this.connector
      .table(this.tableName)
      .where({ id: entityId })
      .first();
  }

  async getByIds(entityIds) {
    if (!entityIds || entityIds.length == 0) return null;
    return await this.connector.table(this.tableName).whereIn("id", entityIds);
  }

  /**
   * Inserts the supplied record(s) to the table and return array of the id(s) of the inserted record.
   * @param {*} records An object or array of objects to be inserted.
   */
  async save(records) {
    if (isObject(records)) {
      delete records.id;
    } else if (isArray(records)) {
      records.forEach(r => {
        delete r.id;
      });
    }
    if (records) return await this.connector.table(this.tableName).insert(records, "id");
  }

  /**
   * Returns the number of records updated
   * @param {*} record
   */
  async update(record) {
    if (isObject(record) && record.id > 0) {
      const id = record.id;
      delete record.id;
      try {
        return await this.connector
          .table(this.tableName)
          .where({ id: id })
          .update(record);
      } finally {
        record.id = id;
      }
    } else {
      return await this.save(record);
    }
  }

  async deleteRecord(id) {
    return await this.connector
      .table(this.tableName)
      .where({ id: id })
      .del();
  }

  /**
   * Delete all record that match the given equality conditions. E.g. {id: 4 }.
   * All fields must be within the table. No joins.
   */
  async deletePermanently(equalityConditions) {
    if (equalityConditions)
      return await this.connector
        .table(this.tableName)
        .where(equalityConditions)
        .del();
  }
}

function isArray(a) {
  return !!a && a.constructor === Array;
}

function isObject(a) {
  return !!a && a.constructor === Object;
}
