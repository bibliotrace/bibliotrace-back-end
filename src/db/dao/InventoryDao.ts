import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Inventory } from "../schema/Inventory";
import Dao from "./Dao";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
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
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where("campus_id", "=", campus_id)
          .where("qr", "=", qr_code)
          .execute();
        return new SuccessResponse(`${qr_code} checked out successfully`);
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to check out ${qr_code} with error ${error.message}`,
          500
        );
      }
    }
  }
}

export default InventoryDao;
