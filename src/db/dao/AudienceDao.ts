import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Audience } from "../schema/Audience";
import Dao from "./Dao";

class AudienceDao extends Dao<Audience, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "audiences";
    this.keyName = "id";
    this.entityName = "audience";
  }
}

export default AudienceDao;
