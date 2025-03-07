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
    this.keyName = "id";
    this.entityName = "restock_item";
  }

  public async addRestockListItem(entity: RestockList, transaction?: Transaction<Database>) {
    if (transaction) {
      return new ServerErrorResponse<RestockList>("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .insertInto(this.tableName as keyof Database)
          .onDuplicateKeyUpdate({ quantity: entity.quantity })
          .values(entity)
          .execute();
        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)} created successfully`,
          entity
        );
      } catch (error) {
        return new ServerErrorResponse<RestockList>(
          `Failed to create ${this.entityName} with error ${error.message}`,
          500
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
        return new SuccessResponse(
          `${result.length} ${this.capitalizeFirstLetter(this.entityName)}(s) deleted successfully`
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
