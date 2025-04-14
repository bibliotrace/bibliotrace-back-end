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

  public async getShoppingList(
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .select(["books.id", "books.book_title", "books.author"])
          .leftJoin("books", "books.id", "shopping_list.book_id")
          .where("campus_id", "=", campus_id)
          .orderBy("books.book_title")
          .execute();

        if (!result) {
          return new SuccessResponse(`No ${this.entityName} found with campus_id ${campus_id}`);
        }

        return new SuccessResponse<any>(
          `${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`,
          result as any
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error}`,
          500
        );
      }
    }
  }

  public async addShoppingListItem(entity: ShoppingList, transaction?: Transaction<Database>) {
    if (transaction) {
      return new ServerErrorResponse<ShoppingList>("Transactions are not supported yet");
    } else {
      try {
        await this.db
          .insertInto(this.tableName as keyof Database)
          .ignore()
          .values(entity)
          .execute();
        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)} created/updated successfully`,
          entity
        );
      } catch (error) {
        return new ServerErrorResponse<ShoppingList>(
          `Failed to create ${this.entityName} with error ${error.message}`
        );
      }
    }
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
