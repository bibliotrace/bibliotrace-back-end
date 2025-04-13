import { createPool, Pool, PoolConnection } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import Database from "../schema/Database";
import fs from "fs";
import path from "path";

export default class DBConnectionManager {
  private pool: Pool;
  kyselyDB: Kysely<Database>;

  // This is effectively the constructor for the class but this way we can have async code in it
  async initialize(): Promise<void> {
    await this.createDatabase();

    this.pool = createPool({
      host: process.env.DB_HOST ?? "localhost",
      user: process.env.DB_USER ?? "admin",
      password: process.env.DB_PASSWORD ?? "Bibl!otrace_2025",
      database: process.env.DB_TARGET_NAME ?? "bibliotrace_v3",
    });

    this.kyselyDB = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: this.pool,
      }),
    });
  }

  private async createDatabase(): Promise<void> {
    const connection = createPool({
      host: process.env.DB_HOST ?? "localhost",
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "password",
    });

    try {
      await new Promise<void>((resolve, reject) => {
        connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_TARGET_NAME}`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await new Promise<void>((resolve, reject) => {
        connection.query(`USE ${process.env.DB_TARGET_NAME}`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (error) {
      console.error("Error creating or using the database:", error);
      throw error; // we need a catch block so we have a catch block lol
    } finally {
      connection.end();
    }
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

  async executeQuery(query: string): Promise<void> {
    const connection = await new Promise<PoolConnection>((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    try {
      await new Promise<void>((resolve, reject) => {
        connection.query(query, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log(`Query ${query}; executed successfully`);
    } catch (error) {
      console.error(`Error executing query ${query}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async runSQLFile(filepath: string): Promise<void> {
    let connection: PoolConnection | undefined;
    try {
      const sql = fs.readFileSync(path.resolve(filepath), "utf8");
      const statements = sql
        .split(/;\s*$/gm)
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      // Get a connection from the pool using a Promise
      connection = await new Promise<PoolConnection>((resolve, reject) => {
        this.pool.getConnection((err, conn) => {
          if (err) reject(err);
          else resolve(conn);
        });
      });

      // Execute each statement sequentially using async/await
      for (const statement of statements) {
        await new Promise<void>((resolve, reject) => {
          connection!.query(statement, (queryErr) => {
            if (queryErr) {
              reject(queryErr);
            } else {
              resolve();
            }
          });
        });
      }

      console.log("SQL file executed successfully");
    } catch (error) {
      console.error("Error executing SQL file:", error);
      throw error; // Propagate the error to the caller
    } finally {
      if (connection) {
        connection.release(); // Ensure the connection is always released
      }
    }
  }

  async resetTables(): Promise<void> {
    await this.executeQuery(
      "DROP TABLE IF EXISTS auth, audit_states, genres, genre_types, tags, shopping_list, restock_list, location, audiences, audit, audit_entry, campus, checkout, genre, tag, inventory, series, suggestions, users, user_roles, books, book_tag, book_genre"
    );
  }

  async runCreateSQL() {
    await this.runSQLFile("./src/db/schema/templates/empty_schema.sql");
  }

  async runAddDummyData() {
    await this.runSQLFile("./src/db/schema/templates/dummy_data.sql");
  }
  async runAddBackLogData() {
    await this.runSQLFile("./src/backlog/Lehi_insert_books.sql");
    await this.runSQLFile("./src/backlog/Lehi_insert_inventory.sql");
  }
}
