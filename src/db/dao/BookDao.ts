import Response from "../../response/Response";
import SuccessResponse from "../../response/SuccessResponse";
import { Book } from "../schema/Book";
import Database from "../schema/Database";
import Dao from "./Dao";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import { Kysely, Transaction } from "kysely";

class BookDao extends Dao<Book, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "books";
    this.keyName = "id";
    this.entityName = "book";
  }

  // TODO: optimize to use index on isbn_list
  public async getBookByIsbn(
    isbn: string,
    transaction?: Transaction<Database>
  ): Promise<Response<Book>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        // console.log("Fetching Book By ISBN", isbn);
        const book = await this.db
          .selectFrom(this.tableName as keyof Database)
          .select([
            "books.id as id",
            "books.book_title as book_title",
            "books.isbn_list as isbn_list",
            "books.author as author",
            "books.primary_genre_id as primary_genre_id",
            "books.audience_id as audience_id",
            "books.pages as pages",
            "books.series_id as series_id",
            "books.series_number as series_number",
            "books.publish_date as publish_date",
            "books.short_description as short_description",
            "books.language as language",
            "books.img_callback as img_callback",
            "audiences.audience_name as audience_name",
            "genre_types.genre_name as genre_name",
            "series.series_name as series_name",
          ])
          .leftJoin("audiences", "audiences.id", "books.audience_id")
          .leftJoin("genre_types", "genre_types.id", "books.primary_genre_id")
          .leftJoin("series", "series.id", "books.series_id")
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
  }

  public async getBookTagsByIsbn(
    isbn: string,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const book = await this.db
          .selectFrom(this.tableName as keyof Database)
          .select("tags.tag")
          .innerJoin("tags", "tags.book_id", "books.id")
          .where("isbn_list", "like", `%${isbn}%` as any)
          .execute();
        if (!book || book.length === 0) {
          return new SuccessResponse(`No book found with isbn ${isbn}`);
        }

        // console.log(book);

        return new SuccessResponse(`Successfully retrieved tags for book with isbn ${isbn}`, book);
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve book with isbn ${isbn} with error ${error}`,
          500
        );
      }
    }
  }

  // TODO: optimize to use index on name
  public async getBookByName(
    name: string,
    transaction?: Transaction<Database>
  ): Promise<Response<Book>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const book = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where("book_title", "=", `${name}` as any)
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
  }

  /*private appendToIsbnList(book: Book, isbn: string): Book {
    const delimiter = "|";
    if (book.isbn_list == null) {
      book.isbn_list = isbn;
    } else {
      book.isbn_list += `${delimiter}${isbn}`;
    }
    return book;
  }*/
}

export default BookDao;
