import { Kysely } from "kysely";
import Database from "../schema/Database";
import { AuditEntry } from "../schema/AuditEntry";
import Dao from "./Dao";

class AuditEntryDao extends Dao<AuditEntry, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "audit_entry";
    this.keyName = "id";
    this.entityName = "audit entry";
  }
}

export default AuditEntryDao;
