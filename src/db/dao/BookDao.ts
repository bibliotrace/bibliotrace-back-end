import { Book } from "../schema/Book";
import Dao from "./Dao";

class BookDao extends Dao<Book, number> {
  constructor() {
    super();
    this.tableName = "books";
    this.keyName = "id";
    this.entityName = "book";
  }
}

export default new BookDao();
