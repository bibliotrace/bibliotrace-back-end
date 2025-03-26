import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Genre } from "../schema/Genre";
import Dao from "./Dao";

class GenreDao extends Dao<Genre, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "genre";
    this.keyName = "id";
    this.entityName = "genre";
  }
}

export default GenreDao;
