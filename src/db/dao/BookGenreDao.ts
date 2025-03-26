import { Kysely } from "kysely";
import Database from "../schema/Database";
import Dao from "./Dao";
import { BookGenre } from "../schema/BookGenre";
import Response from '../../response/Response';
import SuccessResponse from "../../response/SuccessResponse";
import ServerErrorResponse from "../../response/ServerErrorResponse";

class BookGenreDao extends Dao<BookGenre, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "book_genre";
    this.keyName = "id";
    this.entityName = "book genre";
  }

  async getGenresByBookId(bookId: number): Promise<Response<string[]>> {
    try {
      console.log("Fetching Book Genres By book_id", bookId);
      const query = this.db.selectFrom(this.tableName as keyof Database)
      .select(['genre.genre_name'])
      .innerJoin('genre', 'genre.id', 'book_genre.genre_id')
      .where('book_genre.book_id', '=', bookId)

      const result = await (await query.execute()).map(result => result.genre_name)

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

export default BookGenreDao;
