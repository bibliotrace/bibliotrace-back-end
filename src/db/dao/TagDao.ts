import { Tag } from "../schema/Tag";
import Dao from "./Dao";

class TagDao extends Dao<Tag, number> {
  constructor() {
    super();
    this.tableName = "tags";
    this.keyName = "id";
    this.entityName = "tag";
  }
}

export default new TagDao() as TagDao;
