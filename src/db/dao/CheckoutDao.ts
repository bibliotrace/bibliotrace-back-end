import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Checkout } from "../schema/Checkout";
import Dao from "./Dao";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";
import Response from "../../response/Response";

class CheckoutDao extends Dao<Checkout, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "checkout";
    this.keyName = "checkout_id";
    this.entityName = "checkout";
  }

  public async checkin(
    qr_code: string,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where("qr", "=", qr_code)
          .execute();

        if (result[0].numDeletedRows === 0n) {
          return new SuccessResponse(`No checkout found with qr code ${qr_code} to remove`);
        }

        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)} deleted successfully`
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to delete ${this.entityName} with error ${error.message}`,
          500
        );
      }
    }
  }

  // For the popular report

  // Get count by book_id where the timestamp is within a date range (start time and end time)
  //
}

export default CheckoutDao;
