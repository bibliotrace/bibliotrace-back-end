import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Audit } from "../schema/Audit";
import Dao from "./Dao";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";

class AuditDao extends Dao<Audit, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "audit";
    this.keyName = "id";
    this.entityName = "audit";
  }

  public async getCurrentAuditForCampus(
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<Audit>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where("campus_id", "=", campus_id)
          .where("complete_date", "is", null)
          .executeTakeFirst();

        if (!result) {
          return new SuccessResponse(`No ongoing audits`, null);
        }
        return new SuccessResponse<Audit>(
          `Current ${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`,
          result
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

export default AuditDao;
