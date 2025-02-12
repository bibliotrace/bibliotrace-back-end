import { User } from "../schema/User";
import Dao from "./Dao";

class UserDao extends Dao<User, string> {
  constructor() {
    super();
    this.tableName = "users";
    this.keyName = "username";
    this.entityName = "user";
  }
}

export default new UserDao() as UserDao;
