import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Inventory } from "../schema/Inventory";
import Dao from "./Dao";

class InventoryDao extends Dao<Inventory, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "inventories";
    this.keyName = "qr";
    this.entityName = "inventory";
  }
}

export default InventoryDao;
