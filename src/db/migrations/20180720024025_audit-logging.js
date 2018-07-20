export async function up(knex) {
  return await knex.schema.createTable("auditlogs", t => {
    t.increments(); //id: unsigned, primary
    t.timestamp("created_at");
    t.string("eventType");
    t.string("entityName");
    t.integer("entityId");
    t.integer("userId");
    t.string("username", 20);
    t.json("previousData");
    t.json("currentData");
  });
}

export async function down(knex) {
  return await knex.schema.dropTable("auditlogs");
}
