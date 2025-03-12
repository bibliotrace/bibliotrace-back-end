import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Checkout } from "../schema/Checkout";
import Dao from "./Dao";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";
import Response from "../../response/Response";

class CheckoutDao extends Dao<Checkout, string> {
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
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where("qr", "=", qr_code)
          .execute();
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
}

export default CheckoutDao;
