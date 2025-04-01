import { createPool, Pool, PoolConnection } from "mysql2";
import fs from "fs";
import path from "path";
import { Kysely, MysqlDialect } from "kysely";
import Database from "../src/db/schema/Database";

class TestConnectionManager {
  private pool: Pool;
  kyselyDB: Kysely<Database>;

  // this function acts like a constructor that can have awaits in it
  public async initialize() {
    if (process.env.NODE_ENV !== "test") {
      return; // no need to set up a new database connection if we're not running in test
    }

    try {
      await this.createTestDatabase();
      await this.useTestDatabase();
    } catch (error) {
      console.error("Error creating test database:", error);
      throw error;
    }

    this.pool = createPool({
      host: process.env.TEST_DB_HOST ?? "localhost",
      user: process.env.TEST_DB_USER ?? "admin",
      password: process.env.TEST_DB_PASSWORD ?? "Bibl!otrace_2025",
      database: "bibliotrace_v3_test",
    });

    this.kyselyDB = new Kysely<Database>({
      dialect: new MysqlDialect({
        pool: this.pool,
      }),
    });
  }

  private async createTestDatabase(): Promise<void> {
    const connection = createPool({
      host: process.env.TEST_DB_HOST ?? "localhost",
      user: process.env.TEST_DB_USER ?? "root",
      password: process.env.TEST_DB_PASSWORD ?? "password",
    });

    try {
      await new Promise<void>((resolve, reject) => {
        connection.query(`CREATE DATABASE IF NOT EXISTS bibliotrace_v3_test`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (error) {
      console.error("Error creating test database:", error);
      throw error;
    } finally {
      connection.end();
    }
  }

  private async useTestDatabase(): Promise<void> {
    const connection = createPool({
      host: process.env.TEST_DB_HOST ?? "localhost",
      user: process.env.TEST_DB_USER ?? "admin",
      password: process.env.TEST_DB_PASSWORD ?? "Bibl!otrace_2025",

      database: "bibliotrace_v3_test",
    });
    try {
      await new Promise<void>((resolve, reject) => {
        connection.query("USE bibliotrace_v3_test", (err) => {
          if (err) {
            console.error("Error selecting test database:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error using test database:", error);
      throw error;
    } finally {
      connection.end();
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
    } catch (error) {
      console.error(`Error executing SQL file ${path.basename(filepath)}:`, error);
      throw error; // Propagate the error to the caller
    } finally {
      if (connection) {
        connection.release(); // Ensure the connection is always released
      }
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
      //  console.log(`Query ${query}; executed successfully`);
    } catch (error) {
      console.error(`Error executing query ${query}:`, error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async resetTables(): Promise<void> {
    await this.executeQuery(
      "DROP TABLE IF EXISTS auth, audit_states, genres, genre_types, tags, shopping_list, restock_list, location, audiences, audit, audit_entry, campus, checkout, genre, tag, inventory, series, suggestions, users, user_roles, books, book_tag, book_genre"
    );
  }

  async runCreateTestSQL() {
    await this.runSQLFile("./src/db/schema/templates/empty_schema.sql");
  }

  async runAddDummyTestData() {
    await this.runSQLFile("./test/db/schema/dummy_data.sql");
  }

  async teardownDb(): Promise<void> {
    await this.executeQuery("DROP DATABASE IF EXISTS bibliotrace_v3_test");
  }

  async closeConnection(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.pool.end((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new TestConnectionManager();
