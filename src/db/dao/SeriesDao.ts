import { Kysely } from "kysely";
import ServerErrorResponse from "../../response/ServerErrorResponse";
import SuccessResponse from "../../response/SuccessResponse";
import Database from "../schema/Database";
import { Series } from "../schema/Series";
import Dao from "./Dao";

class SeriesDao extends Dao<Series, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "series";
    this.keyName = "id";
    this.entityName = "series";
  }

  async getSeriesNamePerBookId() {
    try {
      const dbQuery = this.db
        .selectFrom(this.tableName as keyof Database)
        .select(["books.id", "series.series_name as seriesName"])
        .innerJoin("books", "books.series_id", "series.id");

      const dbResult = await dbQuery.execute();

      if (dbResult == null) {
        return new ServerErrorResponse("No Series Names found", 404);
      } else {
        return new SuccessResponse("Successfully retrieved book series data", dbResult);
      }
    } catch (error) {
      return new ServerErrorResponse(error.message);
    }
  }
}

export default SeriesDao;
