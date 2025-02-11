import mysql2 from "mysql2/promise";

export default class DBConnectionManager {
  private static _pool: mysql2.Pool = mysql2.createPool({
    host: process.env.DB_HOST ?? "localhost",
    user: process.env.DB_USER ?? "admin",
    password: process.env.DB_PASSWORD ?? "Bibl!otrace_2025",
    database: process.env.DB_TARGET_NAME ?? "bibliotrace_v3",
    waitForConnections: true,
    connectionLimit: 10,
  });

  static async connect(): Promise<void> {
    try {
      await this._pool.query("SELECT 1");
      console.log("Connected to MySQL!");
    } catch (error) {
      console.error("Error connecting to MySQL:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  static async getConnection(): Promise<mysql2.Connection> {
    return await this._pool.getConnection();
  }

  static async closeConnection(connection: mysql2.Connection): Promise<void> {
    await connection.end();
  }

  static get pool(): mysql2.Pool {
    return this._pool;
  }

  static async closePool(): Promise<void> {
    await this._pool.end();
  }
}
