import { Kysely, sql, Transaction } from "kysely";
import TransactionManager from "../../mysql/TransactionManager";
import Database from "../schema/Database";
import Message from "../../message/Message";
import FailMessage from "../../message/FailMessage";
import SuccessMessage from "../../message/SuccessMessage";

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

  async create(entity: E, transaction?: Transaction<Database>): Promise<Message> {
    if (transaction) {
      return new FailMessage("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .insertInto(this.tableName as keyof Database)
          .values(entity)
          .execute();
        return new SuccessMessage(`${this.capitalizeFirstLetter(this.entityName)} created successfully`);
      } catch (error) {
        return new FailMessage(`Failed to create ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  async getByPrimaryKey(key: K, transaction?: Transaction<Database>): Promise<E | Message> {
    if (transaction) {
      return new FailMessage("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(this.keyName as any, "=", key)
          .execute();

        console.log(result)
        return result[0] as E;
      } catch (error) {
        return new FailMessage(`Failed to retrieve ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  async getByKeyAndValue(key: string, value: string, transaction?: Transaction<Database>): Promise<E | Message> {
    if (transaction) {
      return new FailMessage("Transactions are not supported yet", 500)
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(sql`${key}`, "=", value)
          .execute();
        return result[0] as E
      } catch (error) {
        return new FailMessage(`Failed to retrieve value from db table ${this.tableName} using ${key} = ${value} with error ${error}`, 500);
      }
    }
  }

  async getAllOnIndex(index: string, transaction?: Transaction<Database>): Promise<E[] | Message> {
    if (transaction) {
      return new FailMessage("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(sql`${index}`, "=", true)
          .execute();
        return result as E[];
      } catch (error) {
        return new FailMessage(`Failed to retrieve all ${this.entityName}s on ${index} with error ${error}`, 500);
      }
    }
  }

  async getAllMatchingOnIndex(index: string, match: string, transaction?: Transaction<Database>): Promise<E[] | Message> {
    if (transaction) {
      return new FailMessage("Transactions not supported yet", 500);
    } else {
      try {
        const result = await this.db
          .selectFrom(this.tableName as keyof Database)
          .selectAll()
          .where(sql`${index}`, "like", `%${match}%`)
          .execute();
        return result as E[];
      } catch (error) {
        return new FailMessage(`Failed to get all ${this.entityName}s matching ${match} on ${index} with error ${error}`, 500);
      }
    }
  }

  async update(key: K, entity: Partial<E>, transaction?: Transaction<Database>): Promise<Message> {
    if (transaction) {
      return new FailMessage("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .updateTable(this.tableName as keyof Database)
          .set(entity)
          .where(sql`${this.keyName}`, "=", key)
          .execute();
        return new SuccessMessage(`${this.capitalizeFirstLetter(this.entityName)} updated successfully`);
      } catch (error) {
        return new FailMessage(`Failed to update ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  async delete(key: K, transaction?: Transaction<Database>): Promise<Message> {
    if (transaction) {
      return new FailMessage("Transactions not supported yet", 500);
    } else {
      try {
        await this.db
          .deleteFrom(this.tableName as keyof Database)
          .where(sql`${this.keyName}`, "=", key)
          .execute();
        return new SuccessMessage(`${this.capitalizeFirstLetter(this.entityName)} deleted successfully`);
      } catch (error) {
        return new FailMessage(`Failed to delete ${this.entityName} with error ${error}`, 500);
      }
    }
  }

  private capitalizeFirstLetter(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default Dao;
