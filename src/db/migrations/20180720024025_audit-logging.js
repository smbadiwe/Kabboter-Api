export async function up(knex) {
  return await knex.schema.createTable("auditlogs", t => {
    t.increments(); //id: unsigned, primary
    t.timestamp("created_at");
    t.integer("eventType");
    t.string("entityName");
    t.json("entityIds");
    t.integer("userId");
    t.string("username", 20);
    t.json("oldRecord");
    t.json("newRecord");
  });
}

export async function down(knex) {
  return await knex.schema.dropTable("auditlogs");
}
