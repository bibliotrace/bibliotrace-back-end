import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Campus } from "../schema/Campus";
import Response from "../response/Response";
import SuccessResponse from "../response/SuccessResponse";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Dao from "./Dao";

class CampusDao extends Dao<Campus, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "campus";
    this.keyName = "id";
    this.entityName = "campus";
  }
}

export default CampusDao;
