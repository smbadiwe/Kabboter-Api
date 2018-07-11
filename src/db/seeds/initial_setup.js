import { getRoutesRequiringAuthorization } from "../../routes";
import Enums from "../../services/enums";
import { hashSync, genSaltSync } from "bcrypt";

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("quizquestions").del();
  await knex("quizzes").del();
  await knex("users").del();
  await knex("emailaccounts").del();
  await knex("permissions").del();
  await knex("userroles").del();

  await knex("emailaccounts").insert([
    {
      id: 1,
      name: process.env.EMAIL_ACCT,
      smtpHost: process.env.EMAIL_ACCT_SMTP_HOST,
      smtpUsername: process.env.EMAIL_ACCT_SMTP_USEERNAME,
      smtpPassword: process.env.EMAIL_ACCT_SMTP_PASSWORD,
      smtpPort: process.env.EMAIL_ACCT_SMTP_PORT,
      secureSsl: process.env.EMAIL_ACCT_SECURE_SSL,
      useDefaultCredentials: process.env.EMAIL_ACCT_USE_DEFAULT_CREDENTIALS,
      isDefault: true
    }
  ]);

  const pr = getRoutesRequiringAuthorization();
  const prKnex = [];
  pr.forEach((p, i) => {
    if (p.indexOf("/api/") > -1) {
      prKnex.push({ name: p });
    }
  });
  prKnex.map((p, i) => (p.id = i + 1));
  await knex("permissions").insert(prKnex);

  const pids = prKnex.map(p => p.id);
  await knex("userroles").insert([{ id: 1, name: "Super Admin", permissionIds: pids.join(",") }]);

  // Inserts seed entries
  await knex("users").insert([
    {
      id: 1,
      lastname: "Trump",
      firstname: "Donald",
      username: "djt",
      email: "trump@gmail.com",
      organization: "",
      passwordHash: hashSync("donald", genSaltSync()),
      roles: Enums.UserRoleOptions.SuperAdmin
    },
    {
      id: 2,
      lastname: "Cruz",
      firstname: "Ted",
      username: "trc",
      email: "cruz@gmail.com",
      passwordHash: hashSync("ted", genSaltSync()),
      organization: "",
      roles: Enums.UserRoleOptions.SuperAdmin
    },
    {
      id: 3,
      lastname: "Rubio",
      firstname: "Marco",
      username: "mkr",
      email: "rubio@gmail.com",
      passwordHash: hashSync("rubio", genSaltSync()),
      organization: "",
      roles: Enums.UserRoleOptions.SuperAdmin
    }
  ]);

  // Add Quizzes
  await knex("quizzes").insert([
    {
      id: 1,
      title: "States in Nigeria",
      userId: 1,
      audience: Enums.Audience.School,
      visibleTo: Enums.VisibleTo.Everyone
    }
  ]);

  // Quiz questions
  await knex("quizquestions").insert([
    {
      id: 1,
      question: "What is Abia's slogan?",
      quizId: 1,
      timeLimit: 20,
      option1: "God's own state",
      option2: "Sunshine state",
      option3: "Food basket",
      option4: "Center for excellence",
      correctOptions: "1",
      points: 10,
      maxBonus: 5
    },
    {
      id: 2,
      question: "What is Imo's slogan?",
      quizId: 1,
      timeLimit: 20,
      option1: "God's own state",
      option2: "Heartland",
      option3: "Food basket",
      option4: "Center for excellence",
      correctOptions: "2",
      points: 10,
      maxBonus: 5
    },
    {
      id: 3,
      question: "What is Lagos' slogan?",
      quizId: 1,
      timeLimit: 20,
      option1: "God's own state",
      option2: "Heartland",
      option3: "Food basket",
      option4: "Center for excellence",
      correctOptions: "4",
      points: 10,
      maxBonus: 5
    }
  ]);
}
