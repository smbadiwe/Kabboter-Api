import Emailer from "./Emailer";

export async function sendWelcomeEmailToPlayer(user) {
  const viewData = { title: "Welcome to Kabooter", user: user };
  const options = { to: user.email, subject: viewData.title };
  return await new Emailer().sendEmail(options, "welcome-player.html", viewData);
}

export async function sendWelcomeEmailToModerator(user) {
  const viewData = { title: "Welcome to Kabooter", user: user };
  const options = { to: user.email, subject: viewData.title };
  return await new Emailer().sendEmail(options, "welcome-moderator.html", viewData);
}
