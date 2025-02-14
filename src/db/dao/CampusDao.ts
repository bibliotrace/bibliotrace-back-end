import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Campus } from "../schema/Campus";
import Response from "../response/Response";
import SuccessResponse from "../response/SuccessResponse";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Dao from "./Dao";

class CampusDao extends Dao<Campus, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "campus";
    this.keyName = "id";
    this.entityName = "campus";
  }

  public async getByKeyAndValue(
    key: string,
    value: string,
    transaction?: Transaction<Database>
  ): Promise<Response<Campus>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(key as any, "=", value)
          .executeTakeFirst();
        return new SuccessResponse<Campus>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result as Campus
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error}`,
          500
        );
      }
    }
  }

  public async getByCampusName(
    campus_name: string,
    transaction?: Transaction<Database>
  ): Promise<Response<Campus>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where("name", "=", campus_name)
          .executeTakeFirst();
        return new SuccessResponse<Campus>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result as Campus
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

export default CampusDao;
