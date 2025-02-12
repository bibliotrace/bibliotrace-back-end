import { Inventory } from "../schema/Inventory";
import Dao from "./Dao";

class InventoryDao extends Dao<Inventory, string> {
  constructor() {
    super();
    this.tableName = "inventories";
    this.keyName = "qr";
    this.entityName = "inventory";
  }
}

export default new InventoryDao();
