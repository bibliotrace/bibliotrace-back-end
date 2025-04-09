import { Kysely } from "kysely";
import Database from "../schema/Database";
import Dao from "./Dao";
import { BookTag } from "../schema/BookTag";
import SuccessResponse from "../../response/SuccessResponse";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import Response from "../../response/Response";

class BookTagDao extends Dao<BookTag, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "book_tag";
    this.keyName = "id";
    this.entityName = "book tag";
  }

  async getTagsByBookId(bookId: number): Promise<Response<string[]>> {
    try {
      const query = this.db
        .selectFrom(this.tableName as keyof Database)
        .select("tag_name")
        .innerJoin("tag", "tag.id", "book_tag.tag_id")
        .where("book_id", "=", bookId);

      const result = (await query.execute()).map((response) => response.tag_name);

      if (!result) {
        return new SuccessResponse(`No Tags found with bookID ${bookId}`);
      }
      return new SuccessResponse(`Successfully retrieved Tags for bookId ${bookId}`, result);
    } catch (error) {
      return new ServerErrorResponse(`Failed to retrieve Tags for bookId ${bookId} with error ${error}`, 500);
    }
  }

  async getAllTagNamesByBookId(): Promise<Response<object>> {
    try {
      const query = this.db
        .selectFrom(this.tableName as keyof Database)
        .select(["book_tag.book_id", "tag.tag_name"])
        .innerJoin("tag", "tag.id", "book_tag.tag_id");

      const result = await query.execute();

      const outputObject = {};
      for (const tagEntry of result) {
        if (outputObject[tagEntry.book_id] == null) {
          outputObject[tagEntry.book_id] = [tagEntry.tag_name];
        } else {
          (outputObject[tagEntry.book_id]).push(tagEntry.tag_name);
        }
      }

      return new SuccessResponse(`Successfully retrieved Book Tags`, outputObject);
    } catch (error) {
      return new ServerErrorResponse(`Failed to retrieve book tags with error ${error}`, 500);
    }
  }
}

export default BookTagDao;
