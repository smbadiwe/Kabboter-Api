import { BaseEntityService } from "./baseentity.service";
import { UserRoleService, PermissionService, QuizService } from "./";
import { RequestError, Required } from "../utils/ValidationErrors";
import { sign, verify } from "jsonwebtoken";
import { compare, hashSync, genSaltSync } from "bcrypt";
import { generatePin } from "../utils";
import log from "../utils/log";

export default class UserService extends BaseEntityService {
  constructor() {
    super("users");
  }

  async getUserProfile(uid) {
    const user = await this.getById(uid);
    if (user) throw new RequestError("Invalid user id");
    if (user.disabled)
      throw new RequestError(
        "User is currently not active. You need to get reactivated first. Contact admin."
      );

    const result = {
      id: user.id,
      email: user.email,
      username: user.username,
      lastname: user.lastname,
      firstname: user.firstname,
      organization: user.organization,
      usertype: user.usertype
    };
    const quizCount = await new QuizService().getUserQuizCount(uid);
    result.nQuizzes = quizCount;

    return result;
  }

  async changePassword(uid, oldPwd, newPwd) {
    const user = await this.getById(uid);
    if (user) throw new RequestError("Invalid user id");
    if (user.disabled)
      throw new RequestError(
        "User is currently not active. You need to get reactivated first. Contact admin."
      );

    const isPwdSame = await compare(oldPwd, user.passwordHash);
    if (!isPwdSame) throw new RequestError("Wrong password specified for current password");

    user.passwordHash = hashSync(newPwd, genSaltSync());
    await this.update(user);
  }

  async processUserRegistration(userRegInfo) {
    let user = await this.getByEmailOrPhone(userRegInfo.email, userRegInfo.phone);
    if (user) {
      throw new RequestError(
        "Sorry, we already have someone with the username specified. Use the 'Forgot Password' link if you forgot your password."
      );
    }
    let username;
    do {
      username =
        userRegInfo.lastname.substring(0, 2) +
        userRegInfo.firstname.substring(0, 2) +
        generatePin();

      user = await this.getByUsername(username);
    } while (!user);
    user = {
      firstname: userRegInfo.firstname,
      organization: userRegInfo.organization,
      lastname: userRegInfo.lastname,
      email: userRegInfo.email,
      phone: userRegInfo.phone,
      username: username,
      passwordHash: hashSync(userRegInfo.password, genSaltSync()),
      usertype: userRegInfo.usertype
    };
    await this.save(user);

    // log the user in
    return await this.processLogin(userRegInfo.username, userRegInfo.password, true);
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

  async processLogin(username, password, rememberme) {
    const user = await this.connector
      .table(this.tableName)
      .where({ username: username })
      .orWhere({ phone: username })
      .orWhere({ email: username })
      .first();

    if (!user) {
      throw new RequestError("Username or password incorrect");
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
        roleNames = roleNames.substring(0, roleNames.length - 3);
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
        user: {
          i: user.id,
          u: user.username,
          f: user.firstname,
          l: user.lastname,
          r: roleNames
        }
      };
    } else {
      throw new RequestError("Wrong password");
    }
  }
}
