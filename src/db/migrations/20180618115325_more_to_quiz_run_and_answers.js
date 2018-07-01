export async function up(knex) {
  return await knex.schema
    .table("quizruns", t => {
      t.boolean("awardPoints").defaultTo(true);
      t.boolean("awardBonus").defaultTo(true);
    })
    .table("quizquestions", t => {
      t.integer("points").defaultTo(0);
      t.integer("maxBonus").defaultTo(0);
    })
    .table("quizanswers", t => {
      t.integer("points").defaultTo(0);
      t.integer("bonus").defaultTo(0);
    })
    .table("quizzes", t => {
      t.string("description");
    })
    .table("surveys", t => {
      t.string("description");
    })
    .table("users", t => {
      t.string("phone");
      t.string("securityquestion");
      t.string("securityanswer");
      t.string("country", 2);
    });
}

export async function down(knex) {
  return await knex.schema
    .table("users", t => {
      t.dropColumn("phone");
      t.dropColumn("securityquestion");
      t.dropColumn("securityanswer");
      t.dropColumn("country");
    })
    .table("quizzes", t => {
      t.dropColumn("description");
    })
    .table("surveys", t => {
      t.dropColumn("description");
    })
    .table("quizruns", t => {
      t.dropColumn("awardPoints");
      t.dropColumn("awardBonus");
    })
    .table("quizquestions", t => {
      t.dropColumn("points");
      t.dropColumn("maxBonus");
    })
    .table("quizanswers", t => {
      t.dropColumn("points");
      t.dropColumn("bonus");
    });
}
