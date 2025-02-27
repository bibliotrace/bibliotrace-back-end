import DaoFactory from "../db/dao/DaoFactory";
import Response from "../db/response/Response";
import ServerErrorResponse from "../db/response/ServerErrorResponse";
import { Book } from "../db/schema/Book";
import { Checkout } from "../db/schema/Checkout";
import { Inventory } from "../db/schema/Inventory";
import Service from "./Service";

export default class CheckoutService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async checkin(
    qr_code: string,
    campus_name: string
  ): Promise<[Response<any>, Book]> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue(
      "campus_name",
      campus_name
    );
    if (campus_response.statusCode !== 200) {
      return [campus_response, null];
    } else if (!campus_response.object) {
      return [
        new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500),
        null,
      ];
    }

    //get book_id
    const checkout_response = await this.checkoutDao.getByKeyAndValue("qr", qr_code);
    if (checkout_response.statusCode !== 200) {
      return [checkout_response, null];
    } else if (!checkout_response.object) {
      return [
        new ServerErrorResponse(`Could not find book with qr: ${qr_code}`, 500),
        null,
      ];
    }
    const book_id = checkout_response.object.book_id;

    //remove checkout from checkout table
    const checkin_response = await this.checkoutDao.checkin(qr_code);
    if (checkin_response.statusCode !== 200) {
      return [checkin_response, null];
    }

    //TODO: GET LOCATION ID
    //add book to inventory
    const inventory: Inventory = {
      qr: qr_code,
      book_id: book_id,
      location_id: 0,
      campus_id: campus_response.object.id,
      ttl: 10,
    };
    const inventory_response = await this.inventoryDao.create(inventory);
    if (inventory_response.statusCode !== 200) {
      return [inventory_response, null];
    }

    //get checkedin book information and return
    const book_response = await this.bookDao.getByKeyAndValue("id", book_id.toString());
    if (book_response.statusCode !== 200) {
      return [book_response, null];
    }

    return [inventory_response, book_response.object];
  }

  public async checkout(
    qr_code: string,
    campus_name: string
  ): Promise<[Response<any>, Book]> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue(
      "campus_name",
      campus_name
    );
    if (campus_response.statusCode !== 200) {
      return [campus_response, null];
    } else if (!campus_response.object) {
      return [
        new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500),
        null,
      ];
    }

    //check if book is in inventory and get book_id
    const get_inventory_response = await this.inventoryDao.getByKeyAndValue(
      "qr",
      qr_code
    );
    if (get_inventory_response.statusCode !== 200) {
      return [get_inventory_response, null];
    } else if (!get_inventory_response.object) {
      return [
        new ServerErrorResponse(`Could not find book with qr: ${qr_code}`, 500),
        null,
      ];
    }

    const book_id = get_inventory_response.object.book_id;

    //checkout/remove book from inventory
    const inventory_response = await this.inventoryDao.checkout(
      qr_code,
      campus_response.object.id
    );
    if (inventory_response.statusCode !== 200) {
      return [inventory_response, null];
    }

    const checkout_obj: Checkout = {
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      qr: qr_code,
      book_id: book_id,
      state: "Out",
    };
    const checkout_response = await this.checkoutDao.create(checkout_obj);

    //get checked out book information
    const book_response = await this.bookDao.getByKeyAndValue("id", book_id.toString());
    if (book_response.statusCode !== 200) {
      return [book_response, null];
    } else if (!book_response.object) {
      return [
        new ServerErrorResponse(`Could not find book with id: ${book_id}`, 500),
        null,
      ];
    }

    return [checkout_response, book_response.object];
  }
}
