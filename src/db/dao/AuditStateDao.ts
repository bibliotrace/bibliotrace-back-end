import { AuditState } from "../schema/AuditState";
import Dao from "./Dao";

class AuditStateDao extends Dao<AuditState, number> {
  constructor() {
    super();
    this.tableName = "audit_states";
    this.keyName = "id";
    this.entityName = "audit state";
  }
}

export default new AuditStateDao();
