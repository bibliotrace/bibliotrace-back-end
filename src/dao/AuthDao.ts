import { AuthToken } from "../schema/AuthToken";
import Dao from "./Dao";

class AuthDao extends Dao<AuthToken, string> {
  constructor() {
    super();
    this.tableName = "auth";
    this.keyName = "token";
    this.entityName = "auth token";
  }
}

export default new AuthDao();
