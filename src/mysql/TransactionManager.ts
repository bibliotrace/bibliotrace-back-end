import { Kysely, MysqlDialect, Transaction, TransactionBuilder } from "kysely";
import Database from "../db/schema/Database";
import DBConnectionManager from "./DBConnectionManager";

export default class TransactionManager {
  private static connectionManager = DBConnectionManager
  private static dialect =  new MysqlDialect({
    pool: this.connectionManager.pool,
  });
  private static _db = new Kysely<Database>({
    dialect: this.dialect,
  });


  static get db(): Kysely<Database> {
    return this._db;
  }

  // TODO: transaction logic ugh

  /*
  public async runTransaction<T>(
    callback: (trx: Transaction<Database>) => Promise<T>
  ): Promise<T> {
    const connection = await this.connectionManager.getConnection();
    try {
        await connection.beginTransaction();
        const trx = new TransactionBuilder<Database>({
          config: {
            dialect: this.dialect,
          },
          dialect: this.dialect,
          driver: ,
          executor: ,
        }).build();
    }
  }*/
}

