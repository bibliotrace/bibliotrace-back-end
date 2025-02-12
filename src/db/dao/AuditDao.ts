import { Audit } from "../schema/Audit";
import Dao from "./Dao";

class AuditDao extends Dao<Audit, number> {
  constructor() {
    super();
    this.tableName = "audit";
    this.keyName = "book_id";
    this.entityName = "audit";
  }
}

export default new AuditDao() as AuditDao;
