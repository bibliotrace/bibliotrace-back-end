import { Kysely } from "kysely";
import Database from "../schema/Database";
import { GenreType } from "../schema/GenreType";
import Dao from "./Dao";

class GenreTypeDao extends Dao<GenreType, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "genre_types";
    this.keyName = "id";
    this.entityName = "genre type";
  }
}

export default GenreTypeDao;
