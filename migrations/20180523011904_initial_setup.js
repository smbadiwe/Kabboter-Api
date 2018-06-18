export async function up(knex) {
  return await knex.schema
    .createTable("users", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("email").notNull();
      t.string("username").notNull();
      t.string("passwordHash");
      t.string("lastname");
      t.string("firstname");
      t.string("organization");
      t.string("roles");
      t.integer("usertype");
    })
    .createTable("emailaccounts", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("name");
      t.string("email");
      t.string("smtpUsername");
      t.string("smtpPassword");
      t.string("smtpHost");
      t.integer("smtpPort");
      t.boolean("useDefaultCredentials").defaultTo(false);
      t.boolean("secureSsl").defaultTo(true);
      t.boolean("isDefault").defaultTo(false);
    })
    .createTable("permissions", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("name").notNull();
    })
    .createTable("userroles", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("name").notNull();
      t.string("permissionIds");
    })
    .createTable("quizzes", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("title").notNull();
      t.integer("audience");
      t.string("introLink");
      t.integer("visibleTo");
      t.boolean("published").defaultTo(false);
      t.string("creditResources");
      t.integer("userId")
        .unsigned()
        .references("id")
        .inTable("users")
        .notNull();
    })
    .createTable("quizquestions", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("question").notNull();
      t.integer("timeLimit");
      t.integer("quizId")
        .unsigned()
        .references("id")
        .inTable("quizzes")
        .notNull();
      t.string("option1");
      t.string("option2");
      t.string("option3");
      t.string("option4");
      t.string("correctOptions", 10);
      t.integer("introLink");
      t.string("creditResources");
    });
}

export async function down(knex) {
  return await knex.schema
    .dropTable("users")
    .dropTable("userroles")
    .dropTable("permissions")
    .dropTable("emailaccounts")
    .dropTable("quizquestions")
    .dropTable("quizzes");
}
