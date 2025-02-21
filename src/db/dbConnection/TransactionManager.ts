import { Kysely, MysqlDialect } from "kysely";
import Database from "../schema/Database";
import DBConnectionManager from "./DBConnectionManager";

class TransactionManager {
  private _db: Kysely<Database>;
  private connectionManager: typeof DBConnectionManager;
  private dialect: MysqlDialect;

  constructor() {
    this.connectionManager = DBConnectionManager;
    
  }

  public get db(): Kysely<Database> {
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

export default new TransactionManager();
