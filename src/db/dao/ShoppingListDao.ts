import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { ShoppingList } from "../schema/ShoppingList";
import Dao from "./Dao";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";
import Response from "../../response/Response";

class ShoppingListDao extends Dao<ShoppingList, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "shopping_list";
    this.keyName = "book_id";
    this.entityName = "shopping item";
  }

  public async deleteShoppingListItem(
    book_id: number,
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<ShoppingList>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where("book_id", "=", book_id)
          .where("campus_id", "=", campus_id)
          .execute();

        if (result[0].numDeletedRows === 0n) {
          return new SuccessResponse(
            `Shopping item with book id ${book_id} and campus id ${campus_id} not found to remove`
          );
        }

        return new SuccessResponse(
          `Shopping item with book id ${book_id} and campus id ${campus_id} removed successfully`
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

export default ShoppingListDao;
