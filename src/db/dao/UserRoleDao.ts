import { Kysely } from "kysely";
import Database from "../schema/Database";
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
