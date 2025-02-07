import { Suggestion } from "../schema/Suggestion";
import Dao from "./Dao";

class SuggestionDao extends Dao<Suggestion, string> {
  constructor() {
    super();
    this.tableName = "suggestions";
    this.keyName = "timestamp";
    this.entityName = "suggestion";
  }
}

export default new SuggestionDao();
