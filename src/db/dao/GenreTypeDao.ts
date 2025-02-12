import { GenreType } from "../schema/GenreType";
import Dao from "./Dao";

class GenreTypeDao extends Dao<GenreType, number> {
  constructor() {
    super();
    this.tableName = "genre_types";
    this.keyName = "id";
    this.entityName = "genre type";
  }
}

export default new GenreTypeDao() as GenreTypeDao;
