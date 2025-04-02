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

  public async checkin(
    qr_code: string,
    location_id: number,
    campus_name: string
  ): Promise<[Response<any>, Book]> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return [campus_response, null];
    } else if (!campus_response.object) {
      return [new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500), null];
    }

    //get book_id
    const checkout_response = await this.checkoutDao.getByKeyAndValue("qr", qr_code);
    if (checkout_response.statusCode !== 200) {
      return [checkout_response, null];
    } else if (!checkout_response.object) {
      return [new ServerErrorResponse(`Could not find book with qr: ${qr_code}`, 500), null];
    }
    const book_id = checkout_response.object.book_id;

    //remove checkout from checkout table
    const checkin_response = await this.checkoutDao.checkin(qr_code);
    if (checkin_response.statusCode !== 200) {
      return [checkin_response, null];
    }

    //add book to inventory
    const inventory: Inventory = {
      qr: qr_code,
      book_id: book_id,
      location_id: location_id,
      campus_id: campus_response.object.id,
      ttl: 10,
    };
    const inventory_response = await this.inventoryDao.create(inventory);
    if (inventory_response.statusCode !== 200) {
      return [inventory_response, null];
    }

    //remove book if in shopping_list because quantity is now > 0
    const shopping_list_response = await this.shoppingListDao.delete(book_id);
    if (shopping_list_response.statusCode !== 200) {
      return [shopping_list_response, null];
    }

    //get checkedin book information and return
    const book_response = await this.bookDao.getByKeyAndValue("id", book_id.toString());
    if (book_response.statusCode !== 200) {
      return [book_response, null];
    }

    return [inventory_response, book_response.object];
  }

  public async checkout(qr_code: string, campus_name: string): Promise<[Response<any>, Book]> {
    //get campus
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return [campus_response, null];
    } else if (!campus_response.object) {
      return [new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500), null];
    }

    //check if book is in inventory and get book_id
    const get_inventory_response = await this.inventoryDao.getByKeyAndValue("qr", qr_code);
    if (get_inventory_response.statusCode !== 200) {
      return [get_inventory_response, null];
    } else if (!get_inventory_response.object) {
      return [new ServerErrorResponse(`Could not find book with qr: ${qr_code}`, 500), null];
    }

    const book_id = get_inventory_response.object.book_id;

    //checkout/remove book from inventory
    const inventory_response = await this.inventoryDao.checkout(qr_code, campus_response.object.id);
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
      return [new ServerErrorResponse(`Could not find book with id: ${book_id}`, 500), null];
    }

    //get book quantity from inventory and add to shopping list if quantity = 0
    const quantity_response = await this.inventoryDao.getAllByKeyAndValue("book_id", book_id.toString());
    if (quantity_response.statusCode !== 200) {
      return [quantity_response, null];
    }
    const quantity = quantity_response.object.length;
    if (quantity <= 0) {
      //delete from restock if in restock list
      const delete_restock_response = await this.restockListDao.delete(book_id);
      if (delete_restock_response.statusCode !== 200) {
        return [delete_restock_response, null];
      }

      const shopping_item: ShoppingList = {
        book_id: book_id,
        title: book_response.object.book_title,
        author: book_response.object.author,
        campus_id: campus_response.object.id,
      };
      const shopping_list_response = await this.shoppingListDao.create(shopping_item);
      if (shopping_list_response.statusCode !== 200) {
        return [shopping_list_response, null];
      }
    }
    //add to restock list if quantity > 0
    else {
      const restock_item: RestockList = {
        book_id: book_id,
        title: book_response.object.book_title,
        author: book_response.object.author,
        campus_id: campus_response.object.id,
        quantity: quantity,
      };
      const restock_list_response = await this.restockListDao.addRestockListItem(restock_item);
      if (restock_list_response.statusCode !== 200) {
        return [restock_list_response, null];
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
    if (book_response.object == null) return new RequestErrorResponse(`Book with ISBN ${isbn} not found`);
    const book_id = book_response.object.id;

    //add book to inventory
    const inventory: Inventory = {
      qr: qr_code,
      book_id: book_id,
      location_id: location_id,
      campus_id: campus_response.object.id,
      ttl: 10,
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
    const shopping_list_response = await this.shoppingListDao.delete(book_id);
    if (shopping_list_response.statusCode !== 200) {
      return shopping_list_response;
    }

    return book_response;
  }
}
