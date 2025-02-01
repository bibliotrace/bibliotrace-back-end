import {
  DeleteResult,
  InsertResult,
  Kysely,
  MysqlDialect,
  UpdateResult,
} from "kysely";
import mysql from "mysql2/promise";
import Database from "../sql/DatabaseSchema";

const MYSQL_PORT = 3306;

// This class assumes that user input has already been sanitized and validated
class MySQLDao {
  private db: Kysely<Database>;
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST ?? "localhost", //"localhost:" + MYSQL_PORT,
      user: process.env.DB_USER ?? "admin",
      password: process.env.DB_PASSWORD ?? "Bibl!otrace_2025",
      database: process.env.DB_TARGET_NAME ?? "bibliotrace_v3",
    });

    this.db = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: this.pool,
      }),
    });
  }

  async searchBooksByISBNs(isbnList) {
    const patternList = isbnList.map(isbn => `%${isbn}%`);
  
    const results = await this.db
      .selectFrom('books')
      .selectAll()
      .where((eb) => eb.or(patternList.map((pattern) => {
        eb('isbn_list', 'like', pattern)
      })))
      .execute();
  
    return results;
  }

  async connect(): Promise<void> {
    try {
      // Perform a simple query to ensure the connection is successful
      await this.pool.query("SELECT 1");
      console.log("Connected to MySQL!");
    } catch (error) {
      console.error("Error connecting to MySQL:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async createBook(book: Database["books"]): Promise<InsertResult[]> {
    return this.db.insertInto("books").values(book).execute();
  }

  async getBooks(): Promise<Database["books"][]> {
    return this.db.selectFrom("books").selectAll().execute();
  }

  async getBookById(id: number): Promise<Database["books"]> {
    const books = await this.db
      .selectFrom("books")
      .selectAll()
      .where("id", "=", id)
      .execute();
    return books[0]; // ids should be unique, which ensures that this should be the only result in the array
  }

  async updateBook(
    id: number,
    book: Partial<Database["books"]>
  ): Promise<UpdateResult[]> {
    return this.db.updateTable("books").set(book).where("id", "=", id).execute();
  }

  async deleteBook(id: number): Promise<DeleteResult[]> {
    return this.db.deleteFrom("books").where("id", "=", id).execute();
  }

  async createAudit(audit: Database["audit"]): Promise<InsertResult[]> {
    return this.db.insertInto("audit").values(audit).execute();
  }

  async getAuditByBookId(book_id: number): Promise<Database["audit"]> {
    const audits = await this.db
      .selectFrom("audit")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
    return audits[0];
  }

  async updateAudit(
    book_id: number,
    audit: Partial<Database["audit"]>
  ): Promise<UpdateResult[]> {
    return this.db
      .updateTable("audit")
      .set(audit)
      .where("book_id", "=", book_id)
      .execute();
  }

  async deleteAudit(book_id: number): Promise<DeleteResult[]> {
    return this.db.deleteFrom("audit").where("book_id", "=", book_id).execute();
  }

  async createInventory(inventory: Database["inventory"]): Promise<InsertResult[]> {
    return this.db.insertInto("inventory").values(inventory).execute();
  }

  async getInventoryByBookId(book_id: number): Promise<Database["inventory"][]> {
    return this.db
      .selectFrom("inventory")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
  }

  async updateInventory(
    qr: string,
    inventory: Partial<Database["inventory"]>
  ): Promise<UpdateResult[]> {
    return this.db
      .updateTable("inventory")
      .set(inventory)
      .where("qr", "=", qr)
      .execute();
  }

  async deleteInventory(qr: string): Promise<DeleteResult[]> {
    return this.db.deleteFrom("inventory").where("qr", "=", qr).execute();
  }

  async createCheckout(checkout: Database["checkout"]): Promise<InsertResult[]> {
    return this.db.insertInto("checkout").values(checkout).execute();
  }

  async getCheckoutByQr(qr: string): Promise<Database["checkout"]> {
    const checkout = await this.db
      .selectFrom("checkout")
      .selectAll()
      .where("qr", "=", qr)
      .execute();
    return checkout[0];
  }

  async updateCheckout(
    timestamp: string,
    checkout: Partial<Database["checkout"]>
  ): Promise<UpdateResult[]> {
    return this.db
      .updateTable("checkout")
      .set(checkout)
      .where("timestamp", "=", timestamp)
      .execute();
  }

  async deleteCheckout(timestamp: string): Promise<DeleteResult[]> {
    return this.db
      .deleteFrom("checkout")
      .where("timestamp", "=", timestamp)
      .execute();
  }

  async createGenres(genres: Database["genres"]): Promise<InsertResult[]> {
    return this.db.insertInto("genres").values(genres).execute();
  }

  async getGenresByBookId(book_id: number): Promise<Database["genres"]> {
    const genres = await this.db
      .selectFrom("genres")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
    return genres[0];
  }

  async updateGenres(
    book_id: number,
    genres: Partial<Database["genres"]>
  ): Promise<UpdateResult[]> {
    return this.db
      .updateTable("genres")
      .set(genres)
      .where("book_id", "=", book_id)
      .execute();
  }

  async deleteGenres(book_id: number): Promise<DeleteResult[]> {
    return this.db.deleteFrom("genres").where("book_id", "=", book_id).execute();
  }

  async createSeries(series: Database["series"]): Promise<InsertResult[]> {
    return this.db.insertInto("series").values(series).execute();
  }

  async getSeriesById(series_id: number): Promise<Database["series"]> {
    const series = await this.db
      .selectFrom("series")
      .selectAll()
      .where("series_id", "=", series_id)
      .execute();
    return series[0];
  }

  async updateSeries(
    series_id: number,
    series: Partial<Database["series"]>
  ): Promise<UpdateResult[]> {
    return this.db
      .updateTable("series")
      .set(series)
      .where("series_id", "=", series_id)
      .execute();
  }

  async deleteSeries(series_id: number): Promise<DeleteResult[]> {
    return this.db.deleteFrom("series").where("series_id", "=", series_id).execute();
  }

  async createTag(tag: Database["tags"]): Promise<InsertResult[]> {
    return this.db.insertInto("tags").values(tag).execute();
  }

  async getTagsByBookId(book_id: number): Promise<Database["tags"][]> {
    return this.db
      .selectFrom("tags")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
  }

  async updateTag(
    id: number,
    tag: Partial<Database["tags"]>
  ): Promise<UpdateResult[]> {
    return this.db.updateTable("tags").set(tag).where("id", "=", id).execute();
  }

  async deleteTag(id: number): Promise<DeleteResult[]> {
    return this.db.deleteFrom("tags").where("id", "=", id).execute();
  }

  closeConnection(): void {
    this.pool.end();
  }
}

export default MySQLDao;
