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
      console.log("Fetching Book By ISBN", isbn);
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

  public async getBookTagsByIsbn(isbn: string): Promise<Response<any>> {
    try {
      const book = await this.db
        .selectFrom(this.tableName as keyof Database)
        .select("tags.tag")
        .innerJoin("tags", "tags.book_id", "books.id")
        .where("isbn_list", "like", `%${isbn}%` as any)
        .execute();
      if (!book) {
        return new SuccessResponse(`No book found with isbn ${isbn}`);
      }

      console.log(book);

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

  public async getBasicBookByFilter(filterQueryList, isbn, campus): Promise<Response<any>> {
    try {
      // Run SQL stuff
      let dbQuery = this.db
        .selectFrom("books")
        .innerJoin("inventory", "inventory.book_id", "books.id")
        .leftJoin("genre_types", "books.primary_genre_id", "genre_types.id")
        .leftJoin("audiences", "audiences.id", "books.audience_id")
        .leftJoin("series", "series.id", "books.series_id")
        .leftJoin("campus", "campus.id", "inventory.campus_id")
        .select([
          "books.id",
          "books.book_title",
          "books.author",
          "genre_types.genre_name",
          "series.series_name",
        ])
        .where("campus.campus_name", "=", campus)
        .where("books.isbn_list", "like", `%${isbn}%`);

      if (filterQueryList.length > 0) {
        for (const filter of filterQueryList) {
          dbQuery = dbQuery.where(filter.key, "in", filter.value);
        }
      }

      const dbResult = await dbQuery.executeTakeFirst();
      return new SuccessResponse('successfully grabbed book', dbResult)
    } catch (error) {
      return new ServerErrorResponse(`Failed to retrieve book with filter queries: Error ${error.message}`,
        500)
    }
  }

  public async getAllISBNs(filterQueryList, campus): Promise<Response<any>> {
    try {
    let dbQuery = this.db
        .selectFrom("books")
        .distinct()
        .select("isbn_list")
        .innerJoin("inventory", "inventory.book_id", "books.id")
        .leftJoin("genre_types", "books.primary_genre_id", "genre_types.id")
        .leftJoin("audiences", "audiences.id", "books.audience_id")
        .leftJoin("campus", "campus.id", "inventory.campus_id")
        .where("campus.campus_name", "=", campus);

      if (filterQueryList.length > 0) {
        for (const filter of filterQueryList) {
          dbQuery = dbQuery.where(filter.key, "in", filter.value);
        }
      }

      const dbResult = await dbQuery.execute();
      return new SuccessResponse('successfully retrieved all isbns', dbResult)
    } catch (error) {
      return new ServerErrorResponse(`Failed to retrieve all isbns with filter queries: Error ${error.message}`,
        500)
    }
  }
}

export default BookDao;
