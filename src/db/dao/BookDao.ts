import { Server } from "mysql2/typings/mysql/lib/Server";
import Response from "../../response/Response";
import SuccessResponse from "../../response/SuccessResponse";
import { Book } from "../schema/Book";
import Database from "../schema/Database";
import Dao from "./Dao";
import ServerErrorResponse from "../../response/ServerErrorResponse";

class BookDao extends Dao<Book, number> {
  constructor() {
    super();
    this.tableName = "books";
    this.keyName = "id";
    this.entityName = "book";
  }

  // TODO: optimize to use index on isbn_list
  public async getBookByIsbn(isbn: string): Promise<Response<Book>> {
    try {
      const book = await this.db
        .selectFrom(this.tableName as keyof Database)
        .selectAll()
        .where("isbn_list", "like", `%${isbn}%`)
        .executeTakeFirst(); // isbn should be unique, thus we just take the first row containing the isbn
      return new SuccessResponse(`Successfully retrieved book with isbn ${isbn}`, book);
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve book with isbn ${isbn} with error ${error}`,
        500
      );
    }
  }

  // TODO: optimize to use index on name
  public async getBookByName(name: string): Promise<Response<Book>> {
    try {
      const book = await this.db
        .selectFrom(this.tableName as keyof Database)
        .selectAll()
        .where("name", "like", `%${name}%`)
        .executeTakeFirst(); // not necessarily unique but pretty close to it
      // TODO: if not unique, return a list of books matching the provided name
      return new SuccessResponse(`Successfully retrieved book with name ${name}`, book);
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve book with name ${name} with error ${error}`,
        500
      );
    }
  }

  private appendToIsbnList(book: Book, isbn: string): Book {
    const delimiter = "|";
    if (book.isbn_list == null) {
      book.isbn_list = isbn;
    } else {
      book.isbn_list += `${delimiter}${isbn}`;
    }
    return book;
  }
}

export default new BookDao() as BookDao;
