import { Audience } from "../schema/Audience";
import Dao from "./Dao";

class AudienceDao extends Dao<Audience, number> {
  constructor() {
    super();
    this.tableName = "audiences";
    this.keyName = "id";
    this.entityName = "audience";
  }
}

export default new AudienceDao();
