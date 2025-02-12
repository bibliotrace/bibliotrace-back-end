import { Kysely, sql, Transaction } from "kysely";
import Database from "../schema/Database";
import Message from "../../message/Message";
import FailMessage from "../../message/FailMessage";
import SuccessMessage from "../../message/SuccessMessage";

// E is the entity, K is the key
abstract class Dao<E, K extends number | string> {
  tableName: string;
  keyName: string;
  entityName: string;
  db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

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
          .where(key as any, "=", value)
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
          .where(index as any, "=", true)
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
          .where(index as any, "like", `%${match}%`)
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
          .where(this.keyName as any, "=", key)
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
          .where(this.keyName as any, "=", key)
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
