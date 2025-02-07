import { Campus } from "../schema/Campus";
import Dao from "./Dao";

class CampusDao extends Dao<Campus, number> {
  constructor() {
    super();
    this.tableName = "campuses";
    this.keyName = "id";
    this.entityName = "campus";
  }
}

export default new CampusDao();
