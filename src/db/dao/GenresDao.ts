import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Genres } from "../schema/Genres";
import Dao from "./Dao";
import { Book } from "../schema/Book";
import Response from "../../response/Response";
import SuccessResponse from "../../response/SuccessResponse";
import ServerErrorResponse from "../../response/ServerErrorResponse";

class GenresDao extends Dao<Genres, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "genres";
    this.keyName = "book_id";
    this.entityName = "genre";
  }

  async getGenresByBookId(bookId: number): Promise<Response<string[]>> {
    try {
      console.log("Fetching Book Genres By book_id", bookId);
      const bookGenresCTE = this.db
        .selectFrom(this.tableName as keyof Database)
        .selectAll()
        .where("book_id", "=", bookId)
        .as("bookGenresCTE");

      const cteId1 = this.db
        .selectFrom(bookGenresCTE)
        .innerJoin("genre_types", "bookGenresCTE.genre_id_1", "genre_types.id")
        .select(["bookGenresCTE.book_id", "bookGenresCTE.genre_id_1", "genre_types.genre_name"])
        .as("cteId1");
      const cteId2 = this.db
        .selectFrom(bookGenresCTE)
        .innerJoin("genre_types", "bookGenresCTE.genre_id_2", "genre_types.id")
        .select(["bookGenresCTE.book_id", "bookGenresCTE.genre_id_2", "genre_types.genre_name"])
        .as("cteId2");
      const cteId3 = this.db
        .selectFrom(bookGenresCTE)
        .innerJoin("genre_types", "bookGenresCTE.genre_id_3", "genre_types.id")
        .select(["bookGenresCTE.book_id", "bookGenresCTE.genre_id_3", "genre_types.genre_name"])
        .as("cteId3");

      const mainQuery = this.db
        .selectFrom(cteId1)
        .select("genre_name")
        .union(this.db.selectFrom(cteId2).select("genre_name"))
        .union(this.db.selectFrom(cteId3).select("genre_name"));

      const result = await (
        await mainQuery.execute()
      ).map((input) => {
        return input.genre_name;
      });

      if (!result) {
        return new SuccessResponse(`No book found with bookID ${bookId}`);
      }
      return new SuccessResponse(`Successfully retrieved book with bookId ${bookId}`, result);
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve book with bookId ${bookId} with error ${error}`,
        500
      );
    }
  }
}

export default GenresDao;
