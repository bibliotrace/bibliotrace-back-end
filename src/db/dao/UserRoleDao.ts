import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import { UserRole } from "../schema/UserRole";
import Dao from "./Dao";


class UserRoleDao extends Dao<UserRole, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "user_roles";
    this.keyName = "id";
    this.entityName = "user_role";
  }
}
export default UserRoleDao;
