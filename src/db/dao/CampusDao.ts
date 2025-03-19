import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Campus } from "../schema/Campus";
import Dao from "./Dao";

class CampusDao extends Dao<Campus, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "campus";
    this.keyName = "id";
    this.entityName = "campus";
  }

  // this function is literally just a reference to an existing DAO method plus is never used, thus I am commenting it out
  /*async convertCampusStringToId(campus: string): Promise<Response<any>> {
    try {
      const campusResult = await this.getByKeyAndValue('campus_name', campus)
      if (campusResult != null && campusResult.object != null && campusResult.statusCode === 200) {
        return new SuccessResponse("", campusResult.object.id)
      }
    } catch (error) {
      return new ServerErrorResponse(`Error trying to get campus ID from campus string: ${error.message}`)
    }
  }*/
}

export default CampusDao;
