import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import Dao from "./Dao";
import { Location } from "../schema/Location";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";

class LocationDao extends Dao<Location, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "location";
    this.keyName = "id";
    this.entityName = "location";
  }

  public async setInAuditForCampus(
    campus_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .updateTable(this.tableName as keyof Database)
          .set({ in_audit: 1 })
          .where("campus_id", "=", campus_id)
          .execute();

        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)}s updated successfully`
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to update ${this.entityName} with error ${error.message}`,
          500
        );
      }
    }
  }
}

export default LocationDao;
