import mysql2 from "mysql2/promise";

class DBConnectionManager {
  private _pool: mysql2.Pool;

  constructor() {
    this._pool = mysql2.createPool({
      host: process.env.DB_HOST ?? "localhost",
      user: process.env.DB_USER ?? "admin",
      password: process.env.DB_PASSWORD ?? "Bibl!otrace_2025",
      database: process.env.DB_TARGET_NAME ?? "bibliotrace_v3",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  public async getConnection(): Promise<mysql2.Connection> {
    return await this.pool.getConnection();
  }

  public async closeConnection(connection: mysql2.Connection): Promise<void> {
    await connection.end();
  }

  public get pool(): mysql2.Pool {
    return this.pool;
  }

  public async closePool(): Promise<void> {
    await this.pool.end();
  }
}

export default new DBConnectionManager();
