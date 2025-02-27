import { Kysely } from "kysely";
import Database from "../schema/Database";
import Dao from "./Dao";
import { Location } from "../schema/Location";

class LocationDao extends Dao<Location, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "location";
    this.keyName = "id";
    this.entityName = "location";
  }
}

export default LocationDao;
