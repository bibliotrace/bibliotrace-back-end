import { Kysely, Transaction, sql } from "kysely";
import Database from "../schema/Database";
import { Inventory } from "../schema/Inventory";
import Dao from "./Dao";
import RequestErrorResponse from "../../response/RequestErrorResponse";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";
import { Book } from "../schema/Book";

class InventoryDao extends Dao<Inventory, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "inventory";
    this.keyName = "qr";
    this.entityName = "inventory";
  }

  public async updateCheckoutState(
    qr: string,
    campus_id: number,
    is_checked_out: boolean,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .updateTable(this.tableName as keyof Database)
          .set({ is_checked_out: is_checked_out ? 1 : 0 })
          .where("qr", "=", qr)
          .where("campus_id", "=", campus_id)
          .executeTakeFirst();

        if (result.numUpdatedRows > 0) {
          if (result.numChangedRows <= 0) {
            return new SuccessResponse(
              `No inventory items were updated` // TODO: add the updated entity to the response
            );
          } else {
            return new SuccessResponse(
              `${this.capitalizeFirstLetter(this.entityName)} updated successfully` // TODO: add the updated entity to the response
            );
          }
        } else {
          return new RequestErrorResponse(
            `No inventory with qr ${qr} and campus ${campus_id} found`
          );
        }
      } catch (error) {
        if (error.message.includes("Unknown column") && error.message.includes("in 'field list'")) {
          return this.parseUnknownFieldError(error.message);
        }
        return new ServerErrorResponse(
          `Failed to update ${this.entityName} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getBookQuantity(
    book_id: number,
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<number>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where("campus_id", "=", campus_id)
          .where("book_id", "=", book_id)
          .where("is_checked_out", "=", 0)
          .execute();

        return new SuccessResponse(
          `Inventory with book_id: ${book_id} and campus_id: ${campus_id} found successfully`,
          result.length
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to find inventory with book_id: ${book_id} and campus_id: ${campus_id} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getInventoryByCampusAndQr(
    qr_code: string,
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<Inventory>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where("campus_id", "=", campus_id)
          .where("qr", "=", qr_code)
          .executeTakeFirst();

        if (!result) {
          return new SuccessResponse(
            `No inventory with qr: ${qr_code} and campus_id: ${campus_id} found`,
            null
          );
        }
        return new SuccessResponse(
          `Inventory with qr: ${qr_code} and campus_id: ${campus_id} found successfully`,
          result
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to find inventory with qr: ${qr_code} and campus_id: ${campus_id} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getBookByCampusAndQR(
    qr_code: string,
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<Book>> {
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
            "books.isbn_list",
            "books.primary_genre_id",
            "books.audience_id",
          ])
          .leftJoin("books", "books.id", "inventory.book_id")
          .where("campus_id", "=", campus_id)
          .where("qr", "=", qr_code)
          .executeTakeFirst();

        if (!result) {
          return new SuccessResponse(
            `No inventory with qr: ${qr_code} and campus_id: ${campus_id} found`,
            null
          );
        }
        return new SuccessResponse(
          `Inventory with qr: ${qr_code} and campus_id: ${campus_id} found successfully`,
          result
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to find inventory with qr: ${qr_code} and campus_id: ${campus_id} with error ${error.message}`,
          500
        );
      }
    }
  }
  public async getMissingInventoryForAudit(
    audit_id: number,
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<Inventory[]>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .select("qr")
          .where("qr", "not in", (qb) =>
            qb
              .selectFrom("audit_entry" as keyof Database)
              .select("qr")
              .where("audit_id", "=", audit_id)
          )
          .where("campus_id", "=", campus_id)
          .execute();

        if (!result) {
          return new SuccessResponse(`No missing inventory`, null);
        }
        return new SuccessResponse(
          `Missing inventory for audit ${audit_id} found successfully`,
          result as Inventory[]
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to find missing inventory with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getBookDataFromQr(
    qr: string,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet");
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .select([
            "inventory.qr as qr",
            "inventory.location_id as location_id",
            "location.location_name as location_name",
            "inventory.campus_id as campus_id",
            "campus.campus_name as campus_name",
            "inventory.book_id as book_id",
            "books.book_title as book_title",
            "books.author as author",
            "books.series_id as series_id",
            "series.series_name as series_name",
            "books.primary_genre_id as primary_genre_id",
            "genre.genre_name as primary_genre_name",
            "books.isbn_list as isbn_list",
          ])
          .innerJoin("books", "books.id", "inventory.book_id")
          .leftJoin("location", "location.id", "inventory.location_id")
          .leftJoin("campus", "campus.id", "inventory.campus_id")
          .leftJoin("series", "series.id", "books.series_id")
          .leftJoin("genre", "genre.id", "books.primary_genre_id")
          .where("inventory.qr", "=", qr)
          .executeTakeFirst();
        // console.log(result, "HEREs THE RESULTS");
        if (!result) {
          return new RequestErrorResponse(`No book data found for QR code ${qr}`, 404);
        }
        return new SuccessResponse(`Book data successfully retrieved for QR code ${qr}`, result);
      } catch (error) {
        return new ServerErrorResponse(`Failed to get book data for QR ${qr} with error ${error}`);
      }
    }
  }

  public async setLocation(
    qr: string,
    location: number,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet");
    } else {
      try {
        const result = await this.db
          .updateTable(this.tableName as keyof Database)
          .where("qr", "=", qr as any)
          .set({
            location_id: location as any,
          })
          .execute();

        if (result[0].numUpdatedRows === 0n) {
          return new SuccessResponse(`No inventory found with qr ${qr} to update`);
        }

        return new SuccessResponse(`Set location for qr ${qr} successfully`);
      } catch (error) {
        return new ServerErrorResponse(
          `Error occurred during set location query: ${error.message}`
        );
      }
    }
  }

  public async setIsCheckedOut(
    qr: string,
    isCheckedOut: 0 | 1,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet");
    } else {
      try {
        const result = await this.db
          .updateTable(this.tableName as keyof Database)
          .where("qr", "=", qr as any)
          .set({
            is_checked_out: isCheckedOut,
          })
          .execute();

        if (result[0].numUpdatedRows === 0n) {
          return new SuccessResponse(`No inventory found with qr ${qr} to update`);
        }

        return new SuccessResponse(`Set is_checked_out for qr ${qr} successfully`);
      } catch (error) {
        return new ServerErrorResponse(
          `Error occurred during set is_checked_out query: ${error.message}`
        );
      }
    }
  }

  public async getStock(
    campus_id: number,
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
            "genre.genre_name",
            sql`count(inventory.qr)`.as("quantity"),
          ])
          .leftJoin("books", "books.id", "inventory.book_id")
          .leftJoin("genre", "books.primary_genre_id", "genre.id")
          .where("campus_id", "=", campus_id)
          .where("is_checked_out", "=", 0)
          .groupBy("books.id")
          .execute();

        return new SuccessResponse(
          `Inventory with campus_id: ${campus_id} found successfully`,
          result
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to find inventory with campus_id: ${campus_id} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getBookInventoryAvailable(bookId: number) {
    try {
      const cte1 = this.db
        .selectFrom(this.tableName as keyof Database)
        .select(["campus.campus_name as campus", "location.location_name as location"])
        .innerJoin("campus", "campus.id", "inventory.campus_id")
        .innerJoin("location", "location.id", "inventory.location_id")
        .where("inventory.book_id", "=", bookId)
        .where("inventory.is_checked_out", "=", 0)
        .as("cte1");

      const mainQuery = this.db
        .selectFrom(cte1)
        .select([sql`COUNT(*)`.as("count") as any, "campus", "location"] as any)
        .groupBy(["campus", "location"]);

      const result = await mainQuery.execute();
      console.log(result);

      return new SuccessResponse("Successful pull on book inventory", result);
    } catch (error) {
      console.error(error);
      return new ServerErrorResponse(`Error occurred during inventory check: ${error.message}`);
    }
  }
}

export default InventoryDao;
