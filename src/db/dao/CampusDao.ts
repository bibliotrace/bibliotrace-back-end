import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Campus } from "../schema/Campus";
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
