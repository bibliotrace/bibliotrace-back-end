import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Suggestion } from "../schema/Suggestion";
import Dao from "./Dao";

class SuggestionDao extends Dao<Suggestion, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "suggestions";
    this.keyName = "suggestion_id";
    this.entityName = "suggestion";
  }

  // getAllByKeyAndValue is inherited from Dao, so we don't need to implement it again
  /*
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
          `${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`,
          result as Suggestion[]
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error}`,
          500
        );
      }
    }
  }*/
}

export default SuggestionDao;
