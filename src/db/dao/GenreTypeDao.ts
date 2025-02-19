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

  async convertGenreStringToId(genreString: string): Promise<number> {
    try {
      const genreResult = await this.getByKeyAndValue('genre_name', genreString)
      if (genreResult != null && genreResult.object != null && genreResult.statusCode === 200) {
        console.log('Genre Result Object: ', genreResult.object)
        return genreResult.object.id
      } else {
        return -1
      }
    } catch (error) {
      throw new Error(`Error trying to get Genre Type ID from Genre string: ${error.message}`)
    }
  }
}

export default GenreTypeDao;
