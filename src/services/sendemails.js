import Emailer from "./Emailer";
import log from "../utils/log";

/**
 *
 * @param {*} userCategory 'player' or 'moderator'
 * @param {*} user
 */
async function sendWelcomeEmail(userCategory, user) {
  if (!user || !user.email) {
    log.debug(
      "sendWelcomeEmail to %s: No user or user email NoDataReceived. So, we're aborting",
      userCategory
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
  return await new Emailer().sendEmail(options, `welcome-${userCategory}.html`, viewData);
}

/**
 * If you don't want to wait till email is sent, call function without the 'await' keyword
 * @param {*} user
 */
export async function sendWelcomeEmailToPlayer(user) {
  return await sendWelcomeEmail("player", user);
}

/**
 * If you don't want to wait till email is sent, call function without the 'await' keyword
 * @param {*} user
 */
export async function sendWelcomeEmailToModerator(user) {
  return await sendWelcomeEmail("moderator", user);
}
