import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Audit } from "../schema/Audit";
import Dao from "./Dao";

class AuditDao extends Dao<Audit, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "audit";
    this.keyName = "book_id";
    this.entityName = "audit";
  }
}

export default AuditDao;
