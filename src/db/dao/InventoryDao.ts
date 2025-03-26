import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Inventory } from "../schema/Inventory";
import Dao from "./Dao";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";
import { Checkout } from "../schema/Checkout";

class InventoryDao extends Dao<Inventory, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "inventory";
    this.keyName = "qr";
    this.entityName = "inventory";
  }

  public async checkout(
    qr_code: string,
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<Checkout>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where("campus_id", "=", campus_id)
          .where("qr", "=", qr_code)
          .execute();

        if (result[0].numDeletedRows === 0n) {
          return new SuccessResponse(
            `Inventory with qr ${qr_code} and campus id ${campus_id} not found to check out`
          );
        }

        return new SuccessResponse(`${qr_code} checked out successfully`);
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to check out ${qr_code} with error ${error.message}`,
          500
        );
      }
    }
  }

  // this is never called so adios
  /*
  public async updateInventory () {
    console.log('hello!')
  }*/

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
          return new SuccessResponse(`No book data found for QR code ${qr}`);
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

        return new SuccessResponse("Set location for qr successfully");
      } catch (error) {
        return new ServerErrorResponse(
          `Error occurred during set location query: ${error.message}`
        );
      }
    }
  }
}

export default InventoryDao;
