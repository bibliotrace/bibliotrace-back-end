import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Series } from "../schema/Series";
import Dao from "./Dao";

class SeriesDao extends Dao<Series, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "series";
    this.keyName = "id";
    this.entityName = "series";
  }
}

export default SeriesDao;
