import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { AuditEntry } from "../schema/AuditEntry";
import Dao from "./Dao";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";

class AuditEntryDao extends Dao<AuditEntry, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "audit_entry";
    this.keyName = "qr";
    this.entityName = "audit entry";
  }

  public async getAuditReport(
    audit_id: number,
    transaction?: Transaction<Database>
  ): Promise<Response<any>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .select(["audit_entry.state", "books.book_title", "books.author", "audit_entry.qr"])
          .leftJoin("inventory", "audit_entry.qr", "inventory.qr")
          .leftJoin("books", "inventory.book_id", "books.id")
          .where("audit_id", "=", audit_id)
          .execute();

        if (!result || result.length === 0) {
          return new SuccessResponse(`No ${this.entityName}s found with ${this.keyName}`);
        }

        return new SuccessResponse<any>(
          `${this.capitalizeFirstLetter(this.entityName)}s retrieved successfully`,
          result
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName}s with error ${error}`,
          500
        );
      }
    }
  }
}

export default AuditEntryDao;
