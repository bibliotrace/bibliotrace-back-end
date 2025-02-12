import { createPool, Pool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import Database from "../schema/Database";

export default class DBConnectionManager {
  private readonly pool: Pool
  kyselyDB: Kysely<Database>

  constructor(host, user, password, database) {
    this.pool = createPool({
      host: process.env.DB_HOST ?? "localhost",
      user: process.env.DB_USER ?? "admin",
      password: process.env.DB_PASSWORD ?? "Bibl!otrace_2025",
      database: process.env.DB_TARGET_NAME ?? "bibliotrace_v3",
    });

    this.kyselyDB = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: this.pool
      })
    })
  }

  async testConnection(): Promise<void> {
    try {
      this.pool.query("SELECT 1");
      console.log("Connected to MySQL!");
    } catch (error) {
      console.error("Error connecting to MySQL:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }
}
