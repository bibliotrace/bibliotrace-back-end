import { Kysely } from "kysely";
import Database from "../schema/Database";
import Dao from "./Dao";
import { BookTag } from "../schema/BookTag";

class BookTagDao extends Dao<BookTag, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "book_tag";
    this.keyName = "id";
    this.entityName = "book tag";
  }
}

export default BookTagDao;
