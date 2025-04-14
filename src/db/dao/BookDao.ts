import { Kysely, Transaction, sql } from "kysely";
import { FilterListItem } from "../../handler/SearchRouteHandler";
import RequestErrorResponse from "../../response/RequestErrorResponse";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";
import { Book } from "../schema/Book";
import Database from "../schema/Database";
import Dao from "./Dao";

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
            "genre.genre_name as primary_genre_name",
            "series.series_name as series_name",
          ])
          .leftJoin("audiences", "audiences.id", "books.audience_id")
          .leftJoin("genre", "genre.id", "books.primary_genre_id")
          .leftJoin("series", "series.id", "books.series_id")
          .where("isbn_list", "like", `%${isbn}%` as any)
          .executeTakeFirst(); // isbn should be unique, thus we just take the first row containing the isbn
        if (!book) {
          return new RequestErrorResponse(`No book found with isbn ${isbn}`, 404);
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
          .select("tag.tag_name")
          .innerJoin("book_tag", "book_tag.book_id", "books.id")
          .innerJoin("tag", "tag.id", "book_tag.tag_id")
          .where("isbn_list", "like", `%${isbn}%` as any)
          .execute();
        if (!book || book.length === 0) {
          return new SuccessResponse(`No book found with isbn ${isbn}`);
        }

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

  // ADD to this function a check for the Checkout table. If the book is checked out, don't return it

  public async getBasicBookByFilter(
    filterQueryList: FilterListItem[],
    bookId: number,
    campus: string,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        let baseTable;

        if (filterQueryList.length > 0) {
          for (const filter of filterQueryList) {
            if (filter.key === "Special") {
              if (filter.value === "Popular") {
                baseTable = this.db
                  .selectFrom(
                    this.db
                      .selectFrom("checkout")
                      .selectAll()
                      .where("timestamp", ">", sql`DATE_SUB(NOW(), INTERVAL 30 DAY)` as any)
                      .as("cte2")
                  )
                  .innerJoin("books", "books.id", "cte2.book_id" as any)
                  .select([sql`books.*`, sql`COUNT(cte2.qr)`.as("checkouts")] as any)
                  .groupBy("books.id")
                  .orderBy("checkouts" as any, "desc")
                  .as("cte1");
              } else if (filter.value === "Newest") {
                baseTable = this.db
                  .selectFrom("books")
                  .selectAll()
                  .orderBy("books.id", "desc")
                  .limit(50)
                  .as("cte1");
              }
            }
          }
        }

        if (baseTable == null) {
          baseTable = this.db.selectFrom("books").selectAll().as("cte1");
        }

        let dbQuery = this.db
          .selectFrom(baseTable)
          .innerJoin("inventory", "inventory.book_id", "cte1.id")
          .leftJoin("genre", "cte1.primary_genre_id", "genre.id")
          .leftJoin("audiences", "audiences.id", "cte1.audience_id")
          .leftJoin("series", "series.id", "cte1.series_id")
          .leftJoin("campus", "campus.id", "inventory.campus_id")
          .select([
            "cte1.id",
            "cte1.isbn_list",
            "cte1.book_title",
            "cte1.author",
            "genre.genre_name",
            "series.series_name",
          ])
          .where("campus.campus_name", "=", campus)
          .where("cte1.id", "=", bookId as any)
          .where("inventory.is_checked_out", "=", 0);

        if (filterQueryList.length > 0) {
          for (const filter of filterQueryList) {
            if (filter.key != "Special") {
              // we would use in instead of = if the filter value is an array, but in this circumstance it shouldn't be
              dbQuery = dbQuery.where(filter.key as any, "in", filter.value as any);
            }
          }
        }

        const dbResult = await dbQuery.executeTakeFirst();
        if (dbResult) {
          return new SuccessResponse("successfully grabbed book", dbResult);
        } else {
          return new SuccessResponse(
            `No book found with bookId ${bookId} and campus ${campus} matching filters`
          );
        }
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve book with filter queries: Error ${error.message}`,
          500
        );
      }
    }
  }

  // ADD to this function a check for the Checkout table. If a book is checked out, don't return it

  public async getAllBooksMatchingFilter(
    filterQueryList: FilterListItem[],
    campus: string,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        let baseTable;

        if (filterQueryList.length > 0) {
          for (const filter of filterQueryList) {
            if (filter.key === "Special") {
              if (filter.value === "Popular") {
                baseTable = this.db
                  .selectFrom(
                    this.db
                      .selectFrom("checkout")
                      .selectAll()
                      .where("timestamp", ">", sql`DATE_SUB(NOW(), INTERVAL 30 DAY)` as any)
                      .as("cte2")
                  )
                  .innerJoin("books", "books.id", "cte2.book_id" as any)
                  .select([sql`books.*`, sql`COUNT(cte2.qr)`.as("checkouts")] as any)
                  .groupBy("books.id")
                  .orderBy("checkouts" as any, "desc")
                  .as("cte1");
              } else if (filter.value === "Newest") {
                baseTable = this.db
                  .selectFrom("books")
                  .selectAll()
                  .orderBy("books.id", "desc")
                  .limit(50)
                  .as("cte1");
              }
            }
          }
        }

        if (baseTable == null) {
          baseTable = this.db.selectFrom("books").selectAll().as("cte1");
        }

        let dbQuery = this.db
          .selectFrom(baseTable)
          .distinct()
          .innerJoin("inventory", "inventory.book_id", "cte1.id")
          .leftJoin("genre", "cte1.primary_genre_id", "genre.id")
          .leftJoin("audiences", "audiences.id", "cte1.audience_id")
          .leftJoin("campus", "campus.id", "inventory.campus_id")
          .leftJoin("series", "series.id", "cte1.series_id")
          .select([
            "cte1.id",
            "cte1.book_title",
            "cte1.isbn_list",
            "cte1.author",
            "genre.genre_name",
            "series.series_name",
          ])
          .where("campus.campus_name", "=", campus)
          .where("inventory.is_checked_out", "=", 0);

        if (filterQueryList.length > 0) {
          for (const filter of filterQueryList) {
            if (filter.key != "Special") {
              // we would use in instead of = if the filter value is an array, but in this circumstance it shouldn't be
              dbQuery = dbQuery.where(filter.key as any, "in", filter.value as any);
            }
          }
        }

        const dbResult = await dbQuery.execute();
        if (!dbResult || dbResult.length === 0) {
          return new SuccessResponse(
            `No books found on campus ${campus} matching provided filters`
          );
        }
        return new SuccessResponse(
          `Successfully retrieved all books on campus ${campus} matching filters`,
          dbResult
        );
      } catch (error) {
        console.error(error);
        return new ServerErrorResponse(
          `Failed to retrieve all isbns with filter queries: Error ${error.message}`
        );
      }
    }
  }

  public async getAllBookTitlesAndAuthors(): Promise<Response<any>> {
    try {
      const dbQuery = this.db
        .selectFrom("books")
        .select(["books.id", "books.book_title", "books.author"]);

      const dbResult = await dbQuery.execute();

      if (!dbResult || dbResult.length === 0)
        return new SuccessResponse("No Books exist in the table");
      return new SuccessResponse("Successfully pulled all book titles and authors", dbResult);
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve all book titles and authors. Error: ${error.message}`
      );
    }
  }

  public async createBook(
    title,
    isbn_list,
    author,
    primary_genre_id,
    audience_id,
    pages,
    series_id,
    series_number,
    publish_date,
    short_description,
    language,
    img_callback
  ) {
    try {
      if (series_number === "") {
        series_number = 0;
      }
      const insertQuery = this.db
        .insertInto("books")
        .columns([
          "book_title",
          "isbn_list",
          "author",
          "primary_genre_id",
          "audience_id",
          "pages",
          "series_id",
          "series_number",
          "publish_date",
          "short_description",
          "language",
          "img_callback",
        ])
        .values({
          book_title: title,
          isbn_list,
          author,
          primary_genre_id,
          audience_id,
          pages,
          series_id,
          series_number,
          publish_date,
          short_description,
          language,
          img_callback,
        });

      const result = await insertQuery.execute();
      console.log(result, "We Did It!!!");
      return new SuccessResponse("Successfully Created a Book", result);
    } catch (e) {
      return new ServerErrorResponse(e.message, 500);
    }
  }

  public async getPopular(
    campus_id: number,
    start_date: string,
    end_date: string,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .select([
            "books.id",
            "books.book_title",
            "books.author",
            sql`count(checkout.qr)`.as("num_checkouts"),
          ])
          .leftJoin("checkout", "checkout.book_id", "books.id")
          .where("checkout.campus_id", "=", campus_id)
          .where(sql<any>`timestamp between ${start_date} and ${end_date}`)
          .groupBy("books.id")
          .orderBy(sql`count(checkout.qr)`, "desc")
          .execute();

        return new SuccessResponse<any>(
          `${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`,
          result as any
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error}`,
          500
        );
      }
    }
  }

  // Function for getting new arrivals
  // Get distinct counts from inventory sort by the id descending
  // Sort by book id table descending
  // Limit 50?
}

export default BookDao;
