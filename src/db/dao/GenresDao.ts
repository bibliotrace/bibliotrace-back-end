import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Genres } from "../schema/Genres";
import Dao from "./Dao";

class GenresDao extends Dao<Genres, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "genres";
    this.keyName = "book_id";
    this.entityName = "genre";
  }
}

export default GenresDao;
