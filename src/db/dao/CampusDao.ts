import { Kysely, Transaction } from "kysely";
import Database from "../schema/Database";
import { Campus } from "../schema/Campus";
import Response from "../response/Response";
import SuccessResponse from "../response/SuccessResponse";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Dao from "./Dao";

class CampusDao extends Dao<Campus, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "campus";
    this.keyName = "id";
    this.entityName = "campus";
  }

  async convertCampusStringToId(campus: string): Promise<number> {
    try {
      const campusResult = await this.getByKeyAndValue('campus_name', campus)
      if (campusResult != null && campusResult.object != null && campusResult.statusCode === 200) {
        return campusResult.object.id
      }
    } catch (error) {
      throw new Error(`Error trying to get campus ID from campus string: ${error.message}`)
    }
  }
}

export default CampusDao;
