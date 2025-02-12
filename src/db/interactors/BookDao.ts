import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Book } from "../schema/Book";
import Dao from "./Dao";

class BookDao extends Dao<Book, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "books";
    this.keyName = "id";
    this.entityName = "book";
  }
}

export default BookDao;
