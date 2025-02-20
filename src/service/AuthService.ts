import DaoFactory from "../db/dao/DaoFactory";
import Service from "./Service";
import Response from "../db/response/Response";
import RequestErrorResponse from "../db/response/RequestErrorResponse";
import argon2 from "argon2";
import { User } from "../db/schema/User";
import jwt from "jsonwebtoken";
import SuccessResponse from "../db/response/SuccessResponse";
import Dao from "../db/dao/Dao";
import { UserRole } from "../db/schema/UserRole";
import { Campus } from "../db/schema/Campus";
import ServerErrorResponse from "../db/response/ServerErrorResponse";

export class AuthService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  async login(username: string, password: string): Promise<Response<String>> {
    const userResponse = await this.userDao.getByPrimaryKey(username);

    if (userResponse.statusCode !== 200) {
      return new RequestErrorResponse(userResponse.message, 404); // change type from server error to request error
    }

    const realHash = await argon2.verify(userResponse.object.password_hash, password);
    if (realHash) {
      const role = await this.getUserRole(userResponse.object);
      return new SuccessResponse(
        "Token generated successfully",
        await this.buildJWT(role)
      );
    } else {
      console.log("Password Is Wrong");
      return new RequestErrorResponse("Incorrect username or password", 401);
    }
  }

  async createUser(
    username: string,
    password: string,
    role: UserJWTData
  ): Promise<Response<any>> {
    // First grab id's
    const ids = await this.getCampusAndRoleIds(role);
    if (ids instanceof ServerErrorResponse) {
      return ids;
    }
    const { campusId, roleId } = ids;

    // Next grab whether there's another user with the username provided
    const userResponse = await this.userDao.getByPrimaryKey(username);
    if (userResponse.statusCode === 200) {
      return new RequestErrorResponse(
        `User with username ${username} already exists`,
        400
      );
    }

    const hashResponse = await this.hashPassword(password);
    if (hashResponse.statusCode !== 200) {
      return hashResponse;
    }
    const hash = hashResponse.object as string;

    // Then make and send off the new user object
    const newUserObject = {
      username,
      password_hash: hash,
      role_id: roleId,
      email: role.email,
      campus_id: campusId,
    };

    return await this.userDao.create(newUserObject);
  }

  async updateUser(
    username: string,
    password?: string,
    role?: string,
    email?: string,
    campus?: string
  ): Promise<Response<any>> {
    // First look up the user, make sure they exist
    const userResponse = await this.userDao.getByPrimaryKey(username);
    if (userResponse.statusCode !== 200) {
      return new RequestErrorResponse(
        `User with username ${username} does not exist`,
        404
      );
    }
    const user = userResponse.object as User;

    // Next grab id's
    let campusId = user.campus_id;
    if (campus) {
      const campusIdResponse = await this.getIdFromName(campus, this.campusDao);
      if (campusIdResponse.statusCode !== 200) {
        return campusIdResponse;
      }
      campusId = campusIdResponse.object as number;
    }

    let roleId = user.role_id;
    if (role) {
      const roleIdResponse = await this.getIdFromName(role, this.userRoleDao);
      if (roleIdResponse.statusCode !== 200) {
        return roleIdResponse;
      }
      roleId = roleIdResponse.object as number;
    }

    // Next grab the password hash
    let hash = user.password_hash;
    if (password) {
      const hashResponse = await this.hashPassword(password);
      if (hashResponse.statusCode !== 200) {
        return hashResponse;
      }
      hash = hashResponse.object as string;
    }

    // Next populate everything with the latest information
    const newUserObject = {
      username,
      password_hash: hash,
      role_id: roleId,
      email: email ?? user.email,
      campus_id: campusId,
    };

    await this.userDao.update(username, newUserObject);
  }

  async deleteUser(username: string): Promise<Response<any>> {
    // First look up the user, make sure they exist
    const userResponse = await this.userDao.getByPrimaryKey(username);
    if (userResponse.statusCode !== 200) {
      return new RequestErrorResponse(
        `User with username ${username} does not exist`,
        404
      );
    }

    return await this.userDao.delete(username);
  }

  public checkForUserBody(body: any): boolean {
    return (
      body.username != null &&
      body.password != null &&
      body.email != null &&
      body.roleType != null &&
      body.campus != null
    );
  }

  private async buildJWT(userRole: UserJWTData): Promise<string> {
    let token: string;
    if (userRole.roleType === "Admin") {
      token = jwt.sign({ userRole }, process.env.AUTH_KEY ?? "hello world!", {
        expiresIn: "6d",
      });
    } else {
      token = jwt.sign({ userRole }, process.env.AUTH_KEY ?? "hello world!", {
        expiresIn: "1h",
      });
    }
    console.log(`Token Generated: ${token}`);
    return token;
  }

  private async getUserRole(userData: User): Promise<UserJWTData> {
    const campus = await this.campusDao.getByPrimaryKey(userData.campus_id);
    const roleType = await this.userRoleDao.getByPrimaryKey(userData.role_id);
    const email = userData.email;

    return {
      campus: campus.object.campus_name,
      roleType: roleType.object.role_name,
      email,
    };
  }

  // this is only called on the campus and user role DAOs which means we can specify the generics
  private async getIdFromName(
    name: string,
    dao: Dao<Campus | UserRole, number>
  ): Promise<Response<any>> {
    const idResponse = await dao.getByKeyAndValue("name", name);

    if (idResponse.statusCode === 200) {
      return new SuccessResponse(
        `Successfully retrieved id for ${name}`,
        idResponse.object.id
      );
    }

    return idResponse;
  }

  private async getCampusAndRoleIds(
    role: UserJWTData
  ): Promise<ServerErrorResponse | { campusId: number; roleId: number }> {
    const campusIdResponse = await this.getIdFromName(role.campus, this.campusDao);
    if (campusIdResponse.statusCode !== 200) {
      return campusIdResponse;
    }
    const campusId = campusIdResponse.object as number;

    const roleIdResponse = await this.getIdFromName(role.roleType, this.userRoleDao);
    if (roleIdResponse.statusCode !== 200) {
      return roleIdResponse;
    }
    const roleId = roleIdResponse.object as number;

    return { campusId, roleId };
  }

  private async hashPassword(password: string): Promise<Response<string>> {
    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3, // Iterations
        parallelism: 2, // Number of threads
      });
      return new SuccessResponse("Successfully hashed password", hash);
    } catch (error) {
      return new ServerErrorResponse(
        `Unable to hash password ${password} with error ${error.message}`,
        500
      );
    }
  }
}

export interface UserJWTData {
  campus: string;
  roleType: string;
  email: string;
}
