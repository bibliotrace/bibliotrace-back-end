import { Kysely } from "kysely";
import Database from "../schema/Database";
import Dao from "./Dao";
import { BookGenre } from "../schema/BookGenre";

class BookGenreDao extends Dao<BookGenre, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "book_genre";
    this.keyName = "id";
    this.entityName = "book genre";
  }
}

export default BookGenreDao;
