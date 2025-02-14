import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Suggestion } from "../schema/Suggestion";
import Dao from "./Dao";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";

class SuggestionDao extends Dao<Suggestion, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "suggestions";
    this.keyName = "timestamp";
    this.entityName = "suggestion";
  }

  public async getSuggestionsByCampus(
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<Suggestion[]>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where("campus_id", "=", campus_id)
          .execute();
        return new SuccessResponse<Suggestion[]>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result as Suggestion[]
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error}`,
          500
        );
      }
    }
  }
}

export default SuggestionDao;
