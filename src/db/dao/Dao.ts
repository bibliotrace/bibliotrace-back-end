import { Kysely, sql, Transaction } from "kysely";
import Database from "../schema/Database";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";

// E is the entity, K is the key
abstract class Dao<E, K extends number | string> {
  tableName: string;
  keyName: string;
  entityName: string;
  db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  public async create(
    entity: E,
    transaction?: Transaction<Database>
  ): Promise<Response<undefined>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .insertInto(this.tableName as keyof Database)
          .values(entity)
          .execute();
        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)} created successfully`
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to create ${this.entityName} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getByKeyAndValue(
    key: string,
    value: string,
    transaction?: Transaction<Database>
  ): Promise<Response<E>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(key as any, "=", value)
          .executeTakeFirst();
        return new SuccessResponse<E>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result as E
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error}`,
          500
        );
      }
    }
  }

  public async getAllByKeyAndValue(
    key: string,
    value: string,
    transaction?: Transaction<Database>
  ): Promise<Response<E[]>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(key as any, "=", value)
          .execute();
        return new SuccessResponse<E[]>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result as E[]
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error}`,
          500
        );
      }
    }
  }

  public async getByPrimaryKey(
    key: K,
    transaction?: Transaction<Database>
  ): Promise<Response<E>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(this.keyName as any, "=", key)
          .execute();

        return new SuccessResponse<E>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result[0] as E
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve ${this.entityName} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getAllOnIndex(
    index: string,
    transaction?: Transaction<Database>
  ): Promise<Response<E[]>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(index as any, "=", true)
          .execute();
        return new SuccessResponse<E[]>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result as E[]
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve all ${this.entityName}s on ${index} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getAllMatchingOnIndex(
    index: string,
    match: string,
    transaction?: Transaction<Database>
  ): Promise<Response<E[]>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(index as any, "like", `%${match}%`)
          .execute();
        return new SuccessResponse<E[]>(
          `${this.capitalizeFirstLetter(
            this.entityName
          )} retrieved successfully`,
          result as E[]
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve all ${this.entityName}s matching ${match} on ${index} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async getAll(transaction?: Transaction<Database>) {
    if (transaction) {
      return new ServerErrorResponse("Transactions are not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .execute();

        return new SuccessResponse<E[]>(
          `All rows from the ${this.capitalizeFirstLetter(
            this.tableName
          )} table retrieved successfully`,
          result as E[]
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve all data from the ${this.capitalizeFirstLetter(
            this.tableName
          )} table with error ${error.message}`
        );
      }
    }
  }

  public async update(
    key: K,
    entity: Partial<E>,
    transaction?: Transaction<Database>
  ): Promise<Response<undefined>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .updateTable(this.tableName as keyof Database)
          .set(entity)
          .where(this.keyName as any, "=", key)
          .execute();
        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)} updated successfully`
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to update ${this.entityName} with error ${error.message}`,
          500
        );
      }
    }
  }

  public async delete(
    key: K,
    transaction?: Transaction<Database>
  ): Promise<Response<undefined>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where(this.keyName as any, "=", key)
          .execute();
        return new SuccessResponse(
          `${this.capitalizeFirstLetter(this.entityName)} deleted successfully`
        );
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to delete ${this.entityName} with error ${error.message}`,
          500
        );
      }
    }
  }

  capitalizeFirstLetter(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default Dao;
