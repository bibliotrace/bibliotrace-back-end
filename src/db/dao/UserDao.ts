import { Kysely } from "kysely";
import Database from "../schema/Database";
import { User } from "../schema/User";
import Dao from "./Dao";

class UserDao extends Dao<User, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "users";
    this.keyName = "username";
    this.entityName = "user";
  }
}

export default UserDao;
