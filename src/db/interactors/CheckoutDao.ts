import { Checkout } from "../schema/Checkout";
import Dao from "./Dao";

class CheckoutDao extends Dao<Checkout, string> {
  constructor() {
    super();
    this.tableName = "checkout";
    this.keyName = "timestamp";
    this.entityName = "checkout";
  }
}

export default new CheckoutDao();
