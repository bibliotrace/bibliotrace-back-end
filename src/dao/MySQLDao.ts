import {
  DeleteResult,
  InsertResult,
  Kysely,
  MysqlDialect,
  UpdateResult,
} from "kysely";
import mysql from "mysql2/promise";
import Database from "../schema/Database";
import { Book } from "../schema/Book";
import { Audit } from "../schema/Audit";
import { Inventory } from "../schema/Inventory";
import { Checkout } from "../schema/Checkout";
import { Genres } from "../schema/Genres";
import { Series } from "../schema/Series";
import { Tag } from "../schema/Tag";

// This class assumes that user input has already been sanitized and validated
class MySQLDao {
  private db: Kysely<Database>;
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: "localhost",
      user: "admin",
      password: "Bibl!otrace_2025",
      database: "bibliotrace_v3",
    });

    this.db = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: this.pool,
      }),
    });
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

  async createBook(book: Book): Promise<InsertResult[]> {
    return this.db.insertInto("books").values(book).execute();
  }

  async getBooks(): Promise<Book[]> {
    return this.db.selectFrom("books").selectAll().execute();
  }

  async getBookById(id: number): Promise<Book> {
    const books = await this.db
      .selectFrom("books")
      .selectAll()
      .where("id", "=", id)
      .execute();
    return books[0]; // ids should be unique, which ensures that this should be the only result in the array
  }

  async updateBook(id: number, book: Partial<Book>): Promise<UpdateResult[]> {
    return this.db.updateTable("books").set(book).where("id", "=", id).execute();
  }

  async deleteBook(id: number): Promise<DeleteResult[]> {
    return this.db.deleteFrom("books").where("id", "=", id).execute();
  }

  async createAudit(audit: Audit): Promise<InsertResult[]> {
    return this.db.insertInto("audit").values(audit).execute();
  }

  async getAuditByBookId(book_id: number): Promise<Audit> {
    const audits = await this.db
      .selectFrom("audit")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
    return audits[0];
  }

  async updateAudit(
    book_id: number,
    audit: Partial<Audit>
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

  async createInventory(inventory: Inventory): Promise<InsertResult[]> {
    return this.db.insertInto("inventory").values(inventory).execute();
  }

  async getInventoryByBookId(book_id: number): Promise<Inventory[]> {
    return this.db
      .selectFrom("inventory")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
  }

  async updateInventory(
    qr: string,
    inventory: Partial<Inventory>
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

  async createCheckout(checkout: Checkout): Promise<InsertResult[]> {
    return this.db.insertInto("checkout").values(checkout).execute();
  }

  async getCheckoutByQr(qr: string): Promise<Checkout> {
    const checkout = await this.db
      .selectFrom("checkout")
      .selectAll()
      .where("qr", "=", qr)
      .execute();
    return checkout[0];
  }

  async updateCheckout(
    timestamp: string,
    checkout: Partial<Checkout>
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

  async createGenres(genres: Genres): Promise<InsertResult[]> {
    return this.db.insertInto("genres").values(genres).execute();
  }

  async getGenresByBookId(book_id: number): Promise<Genres> {
    const genres = await this.db
      .selectFrom("genres")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
    return genres[0];
  }

  async updateGenres(
    book_id: number,
    genres: Partial<Genres>
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

  async createSeries(series: Series): Promise<InsertResult[]> {
    return this.db.insertInto("series").values(series).execute();
  }

  async getSeriesById(series_id: number): Promise<Series> {
    const series = await this.db
      .selectFrom("series")
      .selectAll()
      .where("series_id", "=", series_id)
      .execute();
    return series[0];
  }

  async updateSeries(
    series_id: number,
    series: Partial<Series>
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

  async createTag(tag: Tag): Promise<InsertResult[]> {
    return this.db.insertInto("tags").values(tag).execute();
  }

  async getTagsByBookId(book_id: number): Promise<Tag[]> {
    return this.db
      .selectFrom("tags")
      .selectAll()
      .where("book_id", "=", book_id)
      .execute();
  }

  async updateTag(id: number, tag: Partial<Tag>): Promise<UpdateResult[]> {
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
