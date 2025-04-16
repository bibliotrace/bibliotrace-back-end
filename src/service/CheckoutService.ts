import DaoFactory from "../db/dao/DaoFactory";
import { Book } from "../db/schema/Book";
import { Checkout } from "../db/schema/Checkout";
import { Inventory } from "../db/schema/Inventory";
import { RestockList } from "../db/schema/RestockList";
import { ShoppingList } from "../db/schema/ShoppingList";
import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Service from "./Service";

export default class CheckoutService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async checkin(qr_code: string, campus_name: string): Promise<[Response<any>, Book]> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return [campus_response, null];
    } else if (!campus_response.object) {
      return [
        new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500),
        null,
      ];
    }

    //get checkedin book information
    const book_response = await this.inventoryDao.getBookByCampusAndQR(
      qr_code,
      campus_response.object.id
    );
    if (book_response.statusCode !== 200) {
      return [book_response, null];
    } else if (!book_response.object) {
      return [new ServerErrorResponse(`Could not find book with qr: ${qr_code}`, 500), null];
    }

    //get quantity of book
    const quantity_response = await this.inventoryDao.getBookQuantity(
      book_response.object.id,
      campus_response.object.id
    );
    if (quantity_response.statusCode !== 200) {
      return [quantity_response, null];
    }

    //remove checkout from checkout table
    const checkin_response = await this.checkoutDao.checkin(qr_code, campus_response.object.id);
    if (checkin_response.statusCode !== 200) {
      return [checkin_response, null];
    }

    //update checkout state of inventory object
    const inventory_response = await this.inventoryDao.updateCheckoutState(
      qr_code,
      campus_response.object.id,
      false
    );
    if (inventory_response.statusCode !== 200) {
      return [inventory_response, null];
    } else if (inventory_response.message.includes("No inventory items were updated")) {
      return [inventory_response, book_response.object];
    }

    //remove book if in shopping_list because quantity is now > 0
    const shopping_list_response = await this.shoppingListDao.deleteShoppingListItem(
      book_response.object.id,
      campus_response.object.id
    );
    if (shopping_list_response.statusCode !== 200) {
      return [shopping_list_response, null];
    }

    //update quantity in restock list
    const updated_restock_item: RestockList = {
      book_id: book_response.object.id,
      campus_id: campus_response.object.id,
      quantity: (quantity_response.object ?? 0) + 1,
    };
    const restock_list_response = await this.restockListDao.addRestockListItem(
      updated_restock_item
    );
    if (restock_list_response.statusCode !== 200) {
      return [restock_list_response, null];
    }

    return [inventory_response, book_response.object];
  }

  public async checkout(qr_code: string, campus_name: string): Promise<[Response<any>, Book]> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return [campus_response, null];
    } else if (!campus_response.object) {
      return [
        new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500),
        null,
      ];
    }

    //get book information
    const book_response = await this.inventoryDao.getBookByCampusAndQR(
      qr_code,
      campus_response.object.id
    );
    if (book_response.statusCode !== 200) {
      return [book_response, null];
    } else if (!book_response.object) {
      return [new ServerErrorResponse(`Could not find book with qr: ${qr_code}`, 500), null];
    }

    const checkout_obj: Checkout = {
      qr: qr_code,
      book_id: book_response.object.id,
      campus_id: campus_response.object.id,
    };
    const checkout_response = await this.checkoutDao.create(checkout_obj);

    //update checkout state of inventory object
    const inventory_response = await this.inventoryDao.updateCheckoutState(
      qr_code,
      campus_response.object.id,
      true
    );
    if (
      inventory_response.statusCode !== 200 ||
      inventory_response.message.includes("No inventory items were updated")
    ) {
      return [inventory_response, book_response.object];
    }

    //get book quantity from inventory
    const quantity_response = await this.inventoryDao.getBookQuantity(
      book_response.object.id,
      campus_response.object.id
    );
    if (quantity_response.statusCode !== 200) {
      return [quantity_response, null];
    }

    //add to restock list if quantity > 0
    if (quantity_response.object && quantity_response.object > 0) {
      const restock_item: RestockList = {
        book_id: book_response.object.id,
        campus_id: campus_response.object.id,
        quantity: quantity_response.object,
      };
      const restock_list_response = await this.restockListDao.addRestockListItem(restock_item);
      if (restock_list_response.statusCode !== 200) {
        return [restock_list_response, null];
      }
    }
    //add to shopping list if quantity = 0 and delete from restock list
    else {
      const delete_restock_response = await this.restockListDao.deleteRestockListItem(
        book_response.object.id,
        campus_response.object.id
      );
      if (delete_restock_response.statusCode !== 200) {
        return [delete_restock_response, null];
      }

      const shopping_item: ShoppingList = {
        book_id: book_response.object.id,
        campus_id: campus_response.object.id,
      };
      const shopping_list_response = await this.shoppingListDao.addShoppingListItem(shopping_item);
      if (shopping_list_response.statusCode !== 200) {
        return [shopping_list_response, null];
      }
    }

    return [checkout_response, book_response.object];
  }

  public async addBook(
    qr_code: string,
    location_id: number,
    campus_name: string,
    isbn: string
  ): Promise<Response<any>> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    //get book_id
    const book_response = await this.bookDao.getBookByIsbn(isbn);
    if (book_response.statusCode !== 200) return book_response;
    if (book_response.object == null)
      return new RequestErrorResponse(`Book with ISBN ${isbn} not found`);
    const book_id = book_response.object.id;

    //add book to inventory
    const inventory: Inventory = {
      qr: qr_code,
      book_id: book_id,
      location_id: location_id,
      campus_id: campus_response.object.id,
    };
    const inventory_response = await this.inventoryDao.create(inventory);
    if (inventory_response.statusCode !== 200) {
      if (
        inventory_response.message != null &&
        !inventory_response.message.includes(`qr ${qr_code} already exists`)
      ) {
        return inventory_response;
      }
    }

    //remove book if in shopping_list because quantity is now > 0
    const shopping_list_response = await this.shoppingListDao.deleteShoppingListItem(
      book_id,
      campus_response.object.id
    );
    if (shopping_list_response.statusCode !== 200) {
      return shopping_list_response;
    }

    return book_response;
  }
}
