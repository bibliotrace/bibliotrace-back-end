import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Tag } from "../schema/Tag";
import Dao from "./Dao";

class TagDao extends Dao<Tag, number> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "tag";
    this.keyName = "id";
    this.entityName = "tag";
  }
}

export default TagDao;
