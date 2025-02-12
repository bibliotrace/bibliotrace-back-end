import { Series } from "../schema/Series";
import Dao from "./Dao";

class SeriesDao extends Dao<Series, number> {
  constructor() {
    super();
    this.tableName = "series";
    this.keyName = "id";
    this.entityName = "series";
  }
}

export default new SeriesDao();
