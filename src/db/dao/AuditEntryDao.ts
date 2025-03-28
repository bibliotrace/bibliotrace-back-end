import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { AuditEntry, State } from "../schema/AuditEntry";
import Dao from "./Dao";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";

class AuditEntryDao extends Dao<AuditEntry, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "audit_entry";
    this.keyName = "id";
    this.entityName = "audit entry";
  }
}

export default AuditEntryDao;
