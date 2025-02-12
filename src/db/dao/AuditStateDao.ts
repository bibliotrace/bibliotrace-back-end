import { Kysely } from "kysely";
import Database from "../schema/Database";
import { AuditState } from "../schema/AuditState";
import Dao from "./Dao";

class AuditStateDao extends Dao<AuditState, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "audit_states";
    this.keyName = "id";
    this.entityName = "audit state";
  }
}

export default AuditStateDao;
