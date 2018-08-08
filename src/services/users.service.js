import { BaseEntityService } from "./baseentity.service";
import { QuizService, SurveyService, QuizAnswerService, SurveyAnswerService } from ".";
import { validatePlayerRegistration } from "../routes/api/public/noauth.validate";
import { RequestError, ValidationError, Required } from "../utils/ValidationErrors";
import { sign } from "jsonwebtoken";
import { compare, hashSync, genSaltSync } from "bcrypt";
import { generatePin } from "../utils";
import { sendWelcomeEmailToPlayer, sendWelcomeEmailToModerator } from "./sendemails";
import Enums from "./enums";
import log from "../utils/log";
import { onLogin, onLogout, onFailedLogin } from "./AuditLogListener";

export default class UserService extends BaseEntityService {
  constructor() {
    super("users");
  }

  async promoteOrDemoteUserRole(userId, isDemoting, requestData) {
    // TODO: Implement audit trail here
    await this.connector
      .table(this.tableName)
      .where("id", userId)
      .update(
        {
          roles: this.connector.raw(isDemoting ? "?? - 1" : "?? + 1", ["roles"])
        },
        ["id", "roles"] // this doesn't work in mysql; but lets just leave it here
      );
  }

  async processResetPassword(payload, requestData) {
    const { username, password } = payload;

    const user = await this.getByUsernameOrEmailOrPhone(username);
    if (!user) {
      throw new ValidationError("User detail is incorrect.");
    }

    const record = { id: user.id, passwordHash: hashSync(password, genSaltSync()) };
    await super.update(record, requestData);
  }

  async validateSecurityQuestion(payload) {
    const { username, securityquestion, securityanswer } = payload;
    if (!username) throw new Required("username");
    if (!securityquestion) throw new Required("securityquestion");
    if (!securityanswer) throw new Required("securityanswer");

    const user = await this.getByUsernameOrEmailOrPhone(username);
    if (!user) {
      throw new ValidationError("User detail is incorrect.");
    }

    if (securityquestion !== user.securityquestion)
      throw new ValidationError(
        "Security question does not match what we have on file for this user."
      );

    const isValid = await compare(securityanswer, user.securityanswer);
    if (!isValid) throw new ValidationError("Answer to security question not correct.");
  }

  async updateUserProfile(userId, payload, requestData) {
    const user = await this.getById(userId);
    if (!user) throw new RequestError("Invalid user id");
    // if security question has changed, then answer must be supplied
    if (user.securityquestion !== payload.securityquestion) {
      if (!payload.securityanswer) throw new Required("securityquestion");
    }
    const updateValues = {
      id: user.id,
      email: payload.email,
      phone: payload.phone,
      lastname: payload.lastname,
      firstname: payload.firstname,
      organization: payload.organization,
      usertype: payload.usertype || Enums.UserType.SocialUser,
      country: payload.country
    };
    if (payload.securityanswer) {
      updateValues.securityquestion = payload.securityquestion;
      updateValues.securityanswer = hashSync(payload.securityanswer, genSaltSync());
    }
    await this.update(updateValues, requestData);
  }

  /**
   * Returns a db-paged list
   * @param {*} payload { perPage: perPage, page: page, ...searchParams  }
   */
  async getAdmins(payload) {
    const { perPage, page } = payload;
    const playerQuery = this.connector
      .table(this.tableName)
      .whereNot({
        roles: Enums.UserRoleOptions.Players,
        deleted: true
      })
      .modify(queryBuilder => {
        if (payload.q) {
          queryBuilder
            .where("lastname", "like", `%${payload.q}%`)
            .orWhere("firstname", "like", `%${payload.q}%`)
            .orWhere("username", "like", `%${payload.q}%`);
        }
      });
    const result = await this.dbPaging(playerQuery, {
      perPage: perPage,
      page: page
    });

    return result; // = { data, pagination }
  }

  /**
   * Returns a db-paged list
   * @param {*} payload { perPage: perPage, page: page, ...searchParams }
   */
  async getPlayers(payload) {
    const { perPage, page } = payload;
    const playeyQuery = this.connector
      .table(this.tableName)
      .where({
        roles: Enums.UserRoleOptions.Players
      })
      .whereNot({
        deleted: true
      })
      .modify(queryBuilder => {
        if (payload.q) {
          queryBuilder
            .where("lastname", "like", `%${payload.q}%`)
            .orWhere("firstname", "like", `%${payload.q}%`)
            .orWhere("username", "like", `%${payload.q}%`);
        }
      });
    const result = await this.dbPaging(playeyQuery, {
      perPage: perPage,
      page: page
    });
    return result; // = { data, pagination }
  }

  async getUserProfile(uid) {
    log.debug("getUserProfile - uid = %d", uid);
    const user = await this.getById(uid);
    if (!user) throw new RequestError("Invalid user id");
    if (user.disabled)
      throw new RequestError(
        "User is currently not active. You need to get reactivated first. Contact admin."
      );

    const result = {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      lastname: user.lastname,
      firstname: user.firstname,
      organization: user.organization,
      usertype: user.usertype,
      country: user.country,
      securityquestion: user.securityquestion,
      securityanswer: user.securityanswer
    };
    result.nQuizzes = await new QuizService().getUserQuizCount(uid);
    result.nSurveys = await new SurveyService().getUserSurveyCount(uid);
    result.nQuizAnswered = await new QuizAnswerService().getUserQuizParticipationCount(uid);
    log.debug("userprofile - result.nQuizAnswered = %o", result.nQuizAnswered);
    result.nSurveyAnswered = await new SurveyAnswerService().getUserSurveyParticipationCount(uid);
    log.debug("userprofile - result.nSurveyAnswered = %o", result.nSurveyAnswered);

    return result;
  }

  async changePassword(uid, oldPwd, newPwd, requestData) {
    const user = await this.getById(uid);
    if (!user) throw new RequestError("Invalid user id");
    if (user.disabled)
      throw new RequestError(
        "User is currently not active. You need to get reactivated first. Contact admin."
      );

    const isPwdSame = await compare(oldPwd, user.passwordHash);
    if (!isPwdSame) throw new RequestError("Wrong password specified for current password");

    user.passwordHash = hashSync(newPwd, genSaltSync());
    await this.update(user, requestData);
  }

  /**
   * This is for admin users
   * @param {*} requestData [Optional] the request; will usually be ctx.request
   */
  async processUserRegistration(requestData) {
    const userRegInfo = requestData.body;
    let user = await this.getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
    if (user) {
      throw new RequestError(
        "Sorry, we already have someone with the email or phone number specified. Use the 'Forgot Password' link if you forgot your password."
      );
    }
    const username = await this.generateUsername(userRegInfo.lastname, userRegInfo.firstname);
    user = {
      firstname: userRegInfo.firstname,
      organization: userRegInfo.organization,
      lastname: userRegInfo.lastname,
      email: userRegInfo.email,
      phone: userRegInfo.phone,
      username: username,
      roles: Enums.UserRoleOptions.Moderator,
      disabled: true, // Moderator cannot create quiz or polls if disabled.
      passwordHash: hashSync(userRegInfo.password, genSaltSync()),
      usertype: userRegInfo.usertype,
      securityquestion: userRegInfo.securityquestion,
      securityanswer: hashSync(userRegInfo.securityanswer, genSaltSync()),
      country: userRegInfo.country
    };
    user.id = await this.save(user, requestData);

    sendWelcomeEmailToModerator(user);
    // automatically log the user in.
    return await this.setJwtAuth(user, requestData);
  }

  /**
   * This is for players
   * @param {*} userRegInfo
   */
  async processPlayerRegistration(userRegInfo, requestData) {
    validatePlayerRegistration(userRegInfo);
    let user;
    if (userRegInfo.username) {
      user = await this.getByUsernameOrEmailOrPhone(userRegInfo.username);
    } else {
      user = await this.getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
    }
    if (user) {
      return {
        i: user.id,
        l: user.lastname,
        f: user.firstname,
        u: user.username,
        e: user.email,
        p: user.phone
      };
    }
    const username = await this.generateUsername(userRegInfo.lastname, userRegInfo.firstname);
    user = {
      firstname: userRegInfo.firstname,
      lastname: userRegInfo.lastname,
      email: userRegInfo.email,
      phone: userRegInfo.phone,
      username: username,
      roles: Enums.UserRoleOptions.Players,
      usertype: Enums.UserType.SocialUser
    };
    user.id = await this.save(user, requestData);
    sendWelcomeEmailToPlayer(user);
    return {
      i: user.id,
      l: userRegInfo.lastname,
      f: userRegInfo.firstname,
      u: username,
      e: user.email,
      p: user.phone
    };
  }

  async generateUsername(lastname, firstname) {
    let username;
    let user;
    do {
      username = lastname.substring(0, 2) + firstname.substring(0, 2) + generatePin(2);

      user = await this.getByUsername(username);
    } while (user);
    return username;
  }

  async getByEmail(email) {
    if (!email) return null;
    return await this.connector
      .table(this.tableName)
      .where({ email: email })
      .first();
  }

  async getByUsername(username) {
    if (!username) return null;
    return await this.connector
      .table(this.tableName)
      .where({ username: username })
      .first();
  }

  async getByEmailOrPhone(email, phone) {
    if (!email && !phone) return null;

    return await this.connector
      .table(this.tableName)
      .first()
      .modify(queryBuilder => {
        if (email && !phone) {
          queryBuilder.where({ email: email });
        } else if (phone && !email) {
          queryBuilder.where({ phone: phone });
        } else {
          queryBuilder.where({ email: email }).orWhere({ phone: phone });
        }
      });
  }

  async getByEmailOrUsername(email, username) {
    if (!email && !username) return null;
    if (!email && username) {
      email = username;
      username = null;
    }
    return await this.connector
      .table(this.tableName)
      .where({ email: email })
      .orWhere({ username: email })
      .first()
      .modify(queryBuilder => {
        if (username) {
          queryBuilder.orWhere({ username: username }).orWhere({ email: username });
        }
      });
  }

  async getByUsernameOrEmailOrPhone(username) {
    if (!username) throw new Required("username");

    const user = await this.connector
      .table(this.tableName)
      .where({ username: username })
      .orWhere({ phone: username })
      .orWhere({ email: username })
      .first();

    return user;
  }

  async setJwtAuth(user, requestData) {
    // jwt sign
    //TODO: Figure out a way to expire tokens. For some ideas, visit
    // https://stackoverflow.com/questions/26739167/jwt-json-web-token-automatic-prolongation-of-expiration
    const userInfo = {
      i: user.id,
      u: user.username,
      r: user.roles,
      d: user.disabled,
      del: user.deleted
    };
    const token = sign(userInfo, process.env.APP_SECRET, {
      expiresIn: "12h"
    });
    userInfo.f = user.firstname;
    userInfo.l = user.lastname;

    // audit log
    try {
      await onLogin({
        requestData: requestData,
        entityName: this.tableName,
        knex: this.connector,
        userId: user.id,
        username: user.username
      });
    } catch (e) {
      log.error("Swallowed Error recording onLogin audit event: %O", e);
    }
    return {
      token: token,
      user: userInfo
    };
  }

  async processLogout(requestData) {
    const user = requestData.user;
    if (user) {
      await onLogout({
        requestData: requestData,
        entityName: this.tableName,
        knex: this.connector,
        userId: user.id,
        username: user.username
      });
    }
  }

  async processLogin(requestData) {
    const { username, password, rememberme } = requestData.body;
    const user = await this.getByUsernameOrEmailOrPhone(username);

    try {
      if (!user) {
        throw new RequestError("User detail is incorrect.");
      }
      if (user.deleted && user.roles !== Enums.UserRoleOptions.SuperAdmin) {
        throw new RequestError("User has been suspended.");
      }
      if (user.disabled && user.roles !== Enums.UserRoleOptions.Moderator) {
        // In this app, 'disabled' for moderators means they can login but cannot create quiz or vote.
        throw new RequestError("You account has been disabled. Contact admin.");
      }

      const isValid = await compare(password, user.passwordHash);
      if (isValid) {
        return await this.setJwtAuth(user, requestData);
      } else {
        throw new RequestError("Wrong password");
      }
    } catch (e) {
      // audit log
      try {
        await onFailedLogin({
          requestData: requestData,
          entityName: this.tableName,
          knex: this.connector,
          username: username
        });
      } catch (e2) {
        log.error("Swallowed Error recording onFailedLogin audit event: %O", e2);
      }
      throw e;
    }
  }
}
