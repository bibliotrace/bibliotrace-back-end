import { UserRole } from "../schema/UserRole";
import Dao from "./Dao";

class UserRoleDao extends Dao<UserRole, number> {
  constructor() {
    super();
    this.tableName = "user_roles";
    this.keyName = "id";
    this.entityName = "user_role";
  }
}

export default new UserRoleDao() as UserRoleDao;
