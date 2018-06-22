export async function up(knex) {
  return await knex.schema
    .createTable("quizruns", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("pin");
      t.integer("quizId")
        .unsigned()
        .references("id")
        .inTable("quizzes")
        .notNull();
      // Game options
      gameOptions(t);
    })
    .createTable("quizanswers", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.integer("quizId")
        .unsigned()
        .references("id")
        .inTable("quizzes")
        .notNull();
      t.integer("quizQuestionId")
        .unsigned()
        .references("id")
        .inTable("quizquestions")
        .notNull();
      t.integer("quizRunId")
        .unsigned()
        .references("id")
        .inTable("quizruns")
        .notNull();
      t.integer("userId")
        .unsigned()
        .references("id")
        .inTable("users")
        .notNull();
      t.integer("choice"); // the option the user choose. 1,2,3,4.
      t.boolean("correct").defaultTo(false); // whether or not the user's answer choice was correct
    })
    .createTable("surveys", t => {
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
    .createTable("surveyquestions", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("question").notNull();
      t.integer("timeLimit");
      t.integer("surveyId")
        .unsigned()
        .references("id")
        .inTable("surveys")
        .notNull();
      t.string("option1");
      t.string("option2");
      t.string("option3");
      t.string("option4");
      t.string("introLink");
      t.string("creditResources");
    })
    .createTable("surveyruns", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.string("pin");
      t.integer("surveyId")
        .unsigned()
        .references("id")
        .inTable("surveys")
        .notNull();
      gameOptions(t);
    })
    .createTable("surveyanswers", t => {
      t.increments(); //id: unsigned, primary
      t.timestamps(true, true); // created_at, updated_at
      t.boolean("disabled").defaultTo(false);
      t.boolean("deleted").defaultTo(false);
      t.integer("surveyId")
        .unsigned()
        .references("id")
        .inTable("surveys")
        .notNull();
      t.integer("surveyQuestionId")
        .unsigned()
        .references("id")
        .inTable("surveyquestions")
        .notNull();
      t.integer("surveyRunId")
        .unsigned()
        .references("id")
        .inTable("surveyruns")
        .notNull();
      t.integer("userId")
        .unsigned()
        .references("id")
        .inTable("users")
        .notNull();
      t.integer("choice"); // the option the user choose. 1,2,3,4.
    });
}

export async function down(knex) {
  return await knex.schema
    .dropTable("quizanswers")
    .dropTable("quizruns")
    .dropTable("surveyanswers")
    .dropTable("surveyruns")
    .dropTable("surveyquestions")
    .dropTable("surveys");
}

function gameOptions(t) {
  t.boolean("randomizeQuestions").defaultTo(false);
  t.boolean("randomizeAnswers").defaultTo(false);
  t.boolean("displayPin").defaultTo(false); // display pin throughout the game
}
