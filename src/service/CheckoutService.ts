import BookDao from "../db/dao/BookDao";
import CampusDao from "../db/dao/CampusDao";
import InventoryDao from "../db/dao/InventoryDao";
import Response from "../db/response/Response";
import { Book } from "../db/schema/Book";

export default class CheckoutService {
  private inventoryDao: InventoryDao;
  private campusDao: CampusDao;
  private bookDao: BookDao;

  constructor(inventoryDao: InventoryDao, campusDao: CampusDao, bookDao: BookDao) {
    this.inventoryDao = inventoryDao;
    this.campusDao = campusDao;
    this.bookDao = bookDao;
  }

  public async checkout(
    qr_code: string,
    campus_name: string
  ): Promise<[Response<any>, Book]> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue("name", campus_name);
    if (campus_response.statusCode !== 200) {
      return [campus_response, null];
    }

    //check if book is in inventory and get book_id
    const inventory_response = await this.inventoryDao.getByKeyAndValue("qr", qr_code);
    if (inventory_response.statusCode !== 200) {
      return [inventory_response, null];
    }
    const book_id = inventory_response.object.book_id.toString();

    //checkout/remove book from inventory
    const checkout_response = await this.inventoryDao.checkout(
      qr_code,
      campus_response.object.id
    );
    if (checkout_response.statusCode !== 200) {
      return [checkout_response, null];
    }

    //get checked out book information
    const book_response = await this.bookDao.getByKeyAndValue("id", book_id);
    if (book_response.statusCode !== 200) {
      return [book_response, null];
    }

    return [checkout_response, book_response.object];
  }
}
