import Response from "../../response/Response";
import SuccessResponse from "../../response/SuccessResponse";
import { Book } from "../schema/Book";
import Database from "../schema/Database";
import Dao from "./Dao";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import { Kysely } from "kysely";

class BookDao extends Dao<Book, number> {
  constructor(db: Kysely<Database>) {
    super(db);
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
        .where("isbn_list", "like", `%${isbn}%` as any)
        .executeTakeFirst(); // isbn should be unique, thus we just take the first row containing the isbn
      if (!book) {
        return new SuccessResponse(`No book found with isbn ${isbn}`);
      }
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
        .where("book_title", "like", `%${name}%` as any)
        .executeTakeFirst(); // not necessarily unique but pretty close to it
      // TODO: if not unique, return a list of books matching the provided name
      if (!book) {
        return new SuccessResponse(`No book found with name ${name}`);
      }
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

export default BookDao;
