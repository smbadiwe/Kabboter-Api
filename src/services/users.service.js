import { BaseEntityService } from "./baseentity.service";
import { UserRoleService, PermissionService, UserPasswordService } from "./";
import { RequestError, Required } from "../utils/ValidationErrors";
import { sign, verify } from "jsonwebtoken";
import { compare, hashSync, genSaltSync } from "bcrypt";
import Emailer from "../utils/Emailer";
import log from "../utils/log";

export default class UserService extends BaseEntityService {
  constructor() {
    super("users");
  }

  async processUserRegistration(userRegInfo) {
    const user = await this.getByEmailOrUsername(userRegInfo.email, userRegInfo.username);
    if (user && !user.disabled) {
      throw new RequestError(
        "Sorry, we already have someone with the email address and/or username specified."
      );
    }

    let userId = 0;
    if (user) {
      // => it's disabled, so it has not been used
      userId = user.id;
      let callUpdate = false;
      if (user.firstname !== userRegInfo.firstname) {
        user.firstname = userRegInfo.firstname;
        callUpdate = true;
      }
      const isPwdSame = await compare(userRegInfo.password, user.passwordHash);
      if (!isPwdSame) {
        user.passwordHash = hashSync(userRegInfo.password, genSaltSync());
        callUpdate = true;
      }
      if (user.lastname !== userRegInfo.lastname) {
        user.lastname = userRegInfo.lastname;
        callUpdate = true;
      }
      if (user.usertype !== userRegInfo.usertype) {
        user.usertype = userRegInfo.usertype;
        callUpdate = true;
      }
      if (callUpdate) {
        await this.update(user);
      }
    } else {
      user = {
        firstname: userRegInfo.firstname,
        organization: userRegInfo.organization,
        lastname: userRegInfo.lastname,
        email: userRegInfo.email,
        username: userRegInfo.username,
        passwordHash: hashSync(userRegInfo.password, genSaltSync()),
        usertype: userRegInfo.usertype,
        disabled: true
      };
      const savedUserId = await this.save(newUser);
      userId = savedUserId[0];
    }
    const userInfo = { u: userId, p: user.passwordHash };
    const token = sign(userInfo, process.env.APP_SECRET, { expiresIn: "20m" });

    // Email the token
    const verifyUrl = `${userRegInfo.url}?token=${token}`;
    const viewData = { title: "Verify Email Address", url: verifyUrl };
    const options = { to: userRegInfo.email, subject: viewData.title };
    const sent = await new Emailer().sendEmail(options, "verifyemail.html", viewData);
    log.debug("Email sender returned: %j", sent);
  }

  async verifyUser(registrationToken) {
    if (!registrationToken) throw new Required("registrationToken");
    const userInfo = verify(registrationToken, process.env.APP_SECRET);
    if (!userInfo) {
      throw new RequestError("Invalid registration token", 401);
    }
    //{ u: pwd.userId, p: pwd.passwordHash }
    const user = await this.getById(userInfo.u);
    if (!user || !user.disabled) {
      throw new RequestError("Fake registration token", 401);
    }
    user.disabled = false;
    await this.update(user);
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
    const user = await this.getByEmailOrUsername(username);
    if (!user) {
      throw new RequestError("Username or password incorrect");
    }
    if (user.disabled) {
      throw new RequestError("Account not yet verified or enabled");
    }

    const isValid = await compare(password, user.passwordHash);
    if (isValid) {
      const roleIds = [];
      if (user.roles) {
        roleIds = user.roles.split(",").map(p => +p);
      }
      const permissionIdsSet = new Set();
      const roleNames = "";
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
      const userInfo = { u: user.email, l: Date.now(), p: userPermissions };
      const token = sign(userInfo, process.env.APP_SECRET, { expiresIn: "12h" });

      return {
        token: token,
        user: {
          i: user.id,
          u: user.username,
          e: user.email,
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
