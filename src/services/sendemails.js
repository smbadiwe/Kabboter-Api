import Emailer from "./Emailer";
import log from "../utils/log";

export async function sendWelcomeEmailToPlayer(user) {
  if (!user || !user.email) {
    log.debug("sendWelcomeEmailToPlayer: No user or user email NoDataReceived. So, we're aborting");
    return;
  }
  const viewData = {
    title: `Welcome to ${process.env.APP_NAME}`,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username
  };
  const options = { to: user.email, subject: viewData.title };
  return await new Emailer().sendEmail(options, "welcome-player.html", viewData);
}

export async function sendWelcomeEmailToModerator(user) {
  if (!user || !user.email) {
    log.debug(
      "sendWelcomeEmailToModerator: No user or user email NoDataReceived. So, we're aborting"
    );
    return;
  }
  const viewData = {
    title: `Welcome to ${process.env.APP_NAME}`,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username
  };
  const options = { to: user.email, subject: viewData.title };
  return await new Emailer().sendEmail(options, "welcome-moderator.html", viewData);
}
