import { Genres } from "../schema/Genres";
import Dao from "./Dao";

class GenresDao extends Dao<Genres, number> {
  constructor() {
    super();
    this.tableName = "genres";
    this.keyName = "book_id";
    this.entityName = "genre";
  }
}

export default new GenresDao();
