import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Suggestion } from "../schema/Suggestion";
import Dao from "./Dao";

class SuggestionDao extends Dao<Suggestion, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "suggestions";
    this.keyName = "suggestion_id";
    this.entityName = "suggestion";
  }
}

export default SuggestionDao;
