import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import { UserRole } from "../schema/UserRole";
import Dao from "./Dao";


class UserRoleDao extends Dao<UserRole, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "user_roles";
    this.keyName = "id";
    this.entityName = "user_role";
  }

  public async getByKeyAndValue(key: string, value: string, transaction?: Transaction<Database>): Promise<Response<UserRole>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(key as any, "=", value)
          .executeTakeFirst();
        return new SuccessResponse<UserRole>(
          `${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`,
          result as UserRole
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

export default UserRoleDao;
