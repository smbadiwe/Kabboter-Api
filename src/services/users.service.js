import { BaseEntityService } from "./baseentity.service";
import {
  UserRoleService,
  PermissionService,
  QuizService,
  SurveyService,
  QuizAnswerService,
  SurveyAnswerService
} from "./";
import { RequestError, ValidationError, Required } from "../utils/ValidationErrors";
import { sign } from "jsonwebtoken";
import { compare, hashSync, genSaltSync } from "bcrypt";
import { generatePin } from "../utils";
import Enums from "./enums";
import log from "../utils/log";

export default class UserService extends BaseEntityService {
  constructor() {
    super("users");
  }

  async processResetPassword(payload) {
    const { username, password } = payload;
    if (!username) throw new Required("username");
    if (!password) throw new Required("password");

    const user = await this.getByUsernameOrEmailOrPhone(username);
    if (!user) {
      throw new ValidationError("Username (or phone or email) is incorrect.");
    }

    const record = { id: user.id, passwordHash: hashSync(password, genSaltSync()) };
    await super.update(record);
  }

  async validateSecurityQuestion(payload) {
    const { username, securityquestion, securityanswer } = payload;
    if (!username) throw new Required("username");
    if (!securityquestion) throw new Required("securityquestion");
    if (!securityanswer) throw new Required("securityanswer");

    const user = await this.getByUsernameOrEmailOrPhone(username);
    if (!user) {
      throw new ValidationError("Username (or phone or email) is incorrect.");
    }

    if (securityquestion !== user.securityquestion)
      throw new ValidationError(
        "Security question does not match what we have on file for this user."
      );

    const isValid = await compare(securityanswer, user.securityanswer);
    if (!isValid) throw new ValidationError("Answer to security question not correct.");
  }

  async updateUserProfile(userId, payload) {
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
    await this.update(updateValues);
  }

  /**
   *
   * @param {*} pagingOptions { perPage: perPage, page: page, }
   */
  async getAdmins(pagingOptions) {
    const playeyQuery = this.connector
      .table(this.tableName)
      .whereNot({
        roles: Enums.UserRoleOptions.Players,
        disabled: true
      })
      .modify(queryBuilder => {
        if (payload.lastname) {
          queryBuilder.where("lastname", "like", `%${payload.lastname}%`);
        }
        if (payload.firstname) {
          queryBuilder.where("firstname", "like", `%${payload.firstname}%`);
        }
        if (payload.username) {
          queryBuilder.where("username", "like", `%${payload.username}%`);
        }
        if (payload.email) {
          queryBuilder.where("email", "like", `%${payload.email}%`);
        }
        if (payload.phone) {
          queryBuilder.where("phone", "like", `%${payload.phone}%`);
        }
      })
      .select();
    const result = await this.dbPaging(playeyQuery, pagingOptions);
    return result; // = { data, pagination }
  }

  /**
   *
   * @param {*} pagingOptions { perPage: perPage, page: page, }
   */
  async getPlayers(payload) {
    const { perPage, page } = payload;
    const playeyQuery = this.connector
      .table(this.tableName)
      .where({
        roles: Enums.UserRoleOptions.Players,
        disabled: false
      })
      .modify(queryBuilder => {
        if (payload.lastname) {
          queryBuilder.where("lastname", "like", `%${payload.lastname}%`);
        }
        if (payload.firstname) {
          queryBuilder.where("firstname", "like", `%${payload.firstname}%`);
        }
        if (payload.username) {
          queryBuilder.where("username", "like", `%${payload.username}%`);
        }
        if (payload.email) {
          queryBuilder.where("email", "like", `%${payload.email}%`);
        }
        if (payload.phone) {
          queryBuilder.where("phone", "like", `%${payload.phone}%`);
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

  async changePassword(uid, oldPwd, newPwd) {
    const user = await this.getById(uid);
    if (!user) throw new RequestError("Invalid user id");
    if (user.disabled)
      throw new RequestError(
        "User is currently not active. You need to get reactivated first. Contact admin."
      );

    const isPwdSame = await compare(oldPwd, user.passwordHash);
    if (!isPwdSame) throw new RequestError("Wrong password specified for current password");

    user.passwordHash = hashSync(newPwd, genSaltSync());
    await this.update(user);
  }

  /**
   * This is for admin users
   * @param {*} userRegInfo
   */
  async processUserRegistration(userRegInfo) {
    if (!userRegInfo.securityquestion) throw new Required("securityquestion");
    if (!userRegInfo.securityanswer) throw new Required("securityanswer");
    if (!userRegInfo.firstname) throw new Required("firstname");
    if (!userRegInfo.lastname) throw new Required("lastname");
    if (!userRegInfo.password) throw new Required("password");
    if (!userRegInfo.email && !userRegInfo.phone)
      throw new ValidationError(
        "We need a way to contact you. Provide eith phone number or email address"
      );
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
      disabled: false, // Moderator cannot create quiz or polls if disabled.
      passwordHash: hashSync(userRegInfo.password, genSaltSync()),
      usertype: userRegInfo.usertype,
      securityquestion: userRegInfo.securityquestion,
      securityanswer: hashSync(userRegInfo.securityanswer, genSaltSync()),
      country: userRegInfo.country
    };
    await this.save(user);

    return {
      email: userRegInfo.email,
      phone: userRegInfo.phone,
      username: username
    };
  }

  /**
   * This is for players
   * @param {*} userRegInfo
   */
  async processPlayerRegistration(userRegInfo) {
    let user;
    if (userRegInfo.username) {
      user = await this.getByUsernameOrEmailOrPhone(userRegInfo.username);
    } else {
      if (!userRegInfo.lastname) {
        throw new RequestError("Last name not set.");
      }
      if (!userRegInfo.firstname) {
        throw new RequestError("First name not set.");
      }
      if (!userRegInfo.email && !userRegInfo.phone) {
        throw new RequestError(
          "We need at least one way to contact you. So give us either email address or phone number"
        );
      }
      user = await this.getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
    }
    if (user) {
      return {
        i: user.id,
        l: user.lastname,
        f: user.firstname,
        u: user.username
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
    const userId = await this.save(user);

    return {
      i: userId,
      l: userRegInfo.lastname,
      f: userRegInfo.firstname,
      u: username
    };
  }

  async generateUsername(lastname, firstname) {
    let username;
    let user;
    do {
      username = lastname.substring(0, 2) + firstname.substring(0, 2) + generatePin();

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
    if (!email && !username) return null;
    if (email && !phone) {
      return await this.connector
        .table(this.tableName)
        .where({ email: email })
        .first();
    }
    if (phone && !email) {
      return await this.connector
        .table(this.tableName)
        .where({ phone: phone })
        .first();
    }

    return await this.connector
      .table(this.tableName)
      .where({ email: email })
      .orWhere({ phone: phone })
      .first();
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
    const user = await this.connector
      .table(this.tableName)
      .where({ username: username })
      .orWhere({ phone: username })
      .orWhere({ email: username })
      .first();

    return user;
  }

  async processLogin(username, password, rememberme) {
    if (!username) throw new Required("username");
    if (!password) throw new Required("password");
    const user = await this.getByUsernameOrEmailOrPhone(username);

    if (!user) {
      throw new RequestError("Username (or phone or email) is incorrect.");
    }
    if (user.disabled) {
      throw new RequestError("Account not yet verified or enabled");
    }

    const isValid = await compare(password, user.passwordHash);
    if (isValid) {
      let roleIds = [];
      if (user.roles) {
        roleIds = user.roles.split(",").map(p => +p);
      }
      const permissionIdsSet = new Set();
      let roleNames = "";
      const rolesObj = await new UserRoleService().getByIds(roleIds);
      if (rolesObj && rolesObj.length > 0) {
        rolesObj.forEach(r => {
          roleNames += `${r.name}, `;
          if (r.permissionIds) {
            const pids = r.permissionIds.split(",");
            pids.forEach(p => {
              permissionIdsSet.add(+p);
            });
          }
        });
        roleNames = roleNames.substring(0, roleNames.length - 2);
      }
      const permissions = await new PermissionService().getByIds([...permissionIdsSet]);
      const userPermissions = [];
      if (permissions && permissions.length > 0) {
        permissions.forEach(p => {
          userPermissions.push(p.name);
        });
      }
      // jwt sign
      //TODO: Figure out a way to expire tokens. For some ideas, visit
      // https://stackoverflow.com/questions/26739167/jwt-json-web-token-automatic-prolongation-of-expiration
      const userInfo = { i: user.id, u: user.username, p: userPermissions };
      const token = sign(userInfo, process.env.APP_SECRET, {
        expiresIn: "12h"
      });

      return {
        token: token,
        user: { i: user.id, u: user.username, f: user.firstname, l: user.lastname, r: roleNames }
      };
    } else {
      throw new RequestError("Wrong password");
    }
  }
}
