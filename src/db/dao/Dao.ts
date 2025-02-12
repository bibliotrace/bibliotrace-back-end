import { Kysely, sql, Transaction } from "kysely";
import TransactionManager from "../mysql/TransactionManager";
import Database from "../schema/Database";
import Response from "../../response/Response";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";

// TODO: more robust error messaging when database throws an error
// E is the entity, K is the key
abstract class Dao<E, K extends number | string> {
  protected transactionManager: typeof TransactionManager;
  private _db: Kysely<Database>;
  private _tableName: string;
  private _keyName: string;
  private _entityName: string;

  constructor() {
    this.transactionManager = TransactionManager;
    this._db = this.transactionManager.db;
  }

  protected set tableName(tableName: string) {
    this._tableName = tableName;
  }

  protected get tableName(): string {
    return this._tableName;
  }

  protected get db(): Kysely<Database> {
    return this._db;
  }

  protected set keyName(keyName: string) {
    this._keyName = keyName;
  }

  protected get keyName(): string {
    return this._keyName;
  }

  protected set entityName(entityName: string) {
    this._entityName = entityName;
  }

  protected get entityName(): string {
    return this._entityName;
  }

  // TODO: make this function work
  /* protected async runQueryInTransaction<V>(
        transaction: Transaction<Database> | null,
        query: (trx: Transaction<Database> | Kysely<Database> ) => Promise<T>
    ): Promise<V> {
        if (transaction) {
            return query(transaction);
        } else {
            return this.transactionManager.runTransaction(query);
        }
    }*/

  protected async create(entity: E, transaction?: Transaction<Database>): Promise<Response<undefined>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .insertInto(this.tableName as keyof Database)
          .values(entity)
          .execute();
        return new SuccessResponse(`${this.capitalizeFirstLetter(this.entityName)} created successfully`);
      } catch (error) {
        return new ServerErrorResponse(`Failed to create ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  protected async getByPrimaryKey(key: K, transaction?: Transaction<Database>): Promise<Response<E>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(sql`${this.keyName}`, "=", key)
          .execute();
        return new SuccessResponse<E>(`${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`, result[0] as E);
      } catch (error) {
        return new ServerErrorResponse(`Failed to retrieve ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  protected async getAllOnIndex(index: string, transaction?: Transaction<Database>): Promise<Response<E[]>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(sql`${index}`, "=", true)
          .execute();
        return new SuccessResponse<E[]>(`${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`, result as E[]);
      } catch (error) {
        return new ServerErrorResponse(`Failed to retrieve all ${this.entityName}s on ${index} with error ${error}`, 500);
      }
    }
  }

  protected async getAllMatchingOnIndex(index: string, match: string, transaction?: Transaction<Database>): Promise<Response<E[]>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(sql`${index}`, "like", `%${match}%`)
          .execute();
        return new SuccessResponse<E[]>(`${this.capitalizeFirstLetter(this.entityName)} retrieved successfully`, result as E[]);
      } catch (error) {
        return new ServerErrorResponse(`Failed to retrieve all ${this.entityName}s matching ${match} on ${index} with error ${error}`, 500);
      }
    }
  }

  protected async update(key: K, entity: Partial<E>, transaction?: Transaction<Database>): Promise<Response<undefined>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .updateTable(this.tableName as keyof Database)
          .set(entity)
          .where(sql`${this.keyName}`, "=", key)
          .execute();
        return new SuccessResponse(`${this.capitalizeFirstLetter(this.entityName)} updated successfully`);
      } catch (error) {
        return new ServerErrorResponse(`Failed to update ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  protected async delete(key: K, transaction?: Transaction<Database>): Promise<Response<undefined>> {
    if (transaction) {
      return new ServerErrorResponse("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where(sql`${this.keyName}`, "=", key)
          .execute();
        return new SuccessResponse(`${this.capitalizeFirstLetter(this.entityName)} deleted successfully`);
      } catch (error) {
        return new ServerErrorResponse(`Failed to delete ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  private capitalizeFirstLetter(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default Dao;
