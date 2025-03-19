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
      return new ServerErrorResponse("Transactions not supported yet", 500);
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
}

export default InventoryDao;
