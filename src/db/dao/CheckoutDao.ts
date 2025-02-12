import { Kysely } from "kysely";
import Database from "../schema/Database";
import { Checkout } from "../schema/Checkout";
import Dao from "./Dao";

class CheckoutDao extends Dao<Checkout, string> {
  constructor(db: Kysely<Database>) {
    super(db);
    this.tableName = "checkout";
    this.keyName = "timestamp";
    this.entityName = "checkout";
  }
}

export default CheckoutDao;
