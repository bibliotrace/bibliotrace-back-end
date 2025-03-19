import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { RestockList } from "../schema/RestockList";
import Dao from "./Dao";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";

class RestockListDao extends Dao<RestockList, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "restock_list";
    this.keyName = "book_id";
    this.entityName = "restock item";
  }

  public async addRestockListItem(entity: RestockList, transaction?: Transaction<Database>) {
    if (transaction) {
      return new ServerErrorResponse<RestockList>("Transactions not supported yet");
    } else {
      try {
        await this.db
          .insertInto(this.tableName as keyof Database)
          .onDuplicateKeyUpdate({ quantity: entity.quantity })
          .values(entity)
          .execute();
        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)} created/updated successfully`,
          entity
        );
      } catch (error) {
        return new ServerErrorResponse<RestockList>(
          `Failed to create ${this.entityName} with error ${error.message}`
        );
      }
    }
  }

  public async deleteRestockListItem(
    book_id: number,
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<RestockList>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where("book_id", "=", book_id)
          .where("campus_id", "=", campus_id)
          .execute();

        if (result[0].numDeletedRows === 0n) {
          return new SuccessResponse(
            `Restock item with book id ${book_id} and campus id ${campus_id} not found to remove`
          );
        }
        // logic counting number of deleted items removed as there is no way for a duplicate entry with the same book_id and campus_id to exist
        // if it did, the onDuplicateKeyUpdate would have updated the row instead of creating a new one
        // so we can safely assume that the number of rows deleted on a successful delete is always 1
        return new SuccessResponse(
          `Restock item with book id ${book_id} and campus id ${campus_id} removed successfully`
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

export default RestockListDao;
