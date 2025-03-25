import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Tag } from "../schema/Tag";
import Dao from "./Dao";
import SuccessResponse from "../../response/SuccessResponse";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import Response from "../../response/Response";

class TagDao extends Dao<Tag, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "tags";
    this.keyName = "id";
    this.entityName = "tag";
  }

  async getTagsByBookId(bookId: number): Promise<Response<string[]>> {
    try {
      const query = this.db.selectFrom(this.tableName as keyof Database)
      .select('tag')
      .where('book_id', '=', bookId)

      const result = (await query.execute()).map(response => response.tag)

      if (!result) {
        return new SuccessResponse(`No Tags found with bookID ${bookId}`);
      }
      return new SuccessResponse(`Successfully retrieved Tags for bookId ${bookId}`, result);
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve Tags for bookId ${bookId} with error ${error}`,
        500
      );
    }
  }
}

export default TagDao;
