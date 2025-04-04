import DaoFactory from "../db/dao/DaoFactory";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Service from "./Service";
import { ShoppingList } from "../db/schema/ShoppingList";
import { Campus } from "../db/schema/Campus";
import { RestockList } from "../db/schema/RestockList";
import { Audit } from "../db/schema/Audit";

export default class ReportService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async getShoppingListForCampus(
    campus_name: string
  ): Promise<Response<Campus | ShoppingList[]>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.shoppingListDao.getAllByKeyAndValue(
      "campus_id",
      campus_response.object.id.toString()
    );
  }

  public async deleteShoppingListItem(
    book_id: number,
    campus_name: string
  ): Promise<Response<Campus | ShoppingList>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.shoppingListDao.deleteShoppingListItem(book_id, campus_response.object.id);
  }

  public async moveShoppingItemToRestock(
    book_id: number,
    campus_name: string
  ): Promise<Response<Campus | ShoppingList | RestockList>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    //get shopping list item
    const get_shopping_response = await this.shoppingListDao.getByKeyAndValue(
      "book_id",
      book_id.toString()
    );
    if (get_shopping_response.statusCode !== 200) {
      return get_shopping_response;
    }
    const shopping_item = get_shopping_response.object;

    //delete from shopping list
    const delete_shopping_response = await this.shoppingListDao.deleteShoppingListItem(
      book_id,
      campus_response.object.id
    );
    if (delete_shopping_response.statusCode !== 200) {
      return delete_shopping_response;
    }

    //add to restock list
    const restock_item: RestockList = {
      book_id: book_id,
      title: shopping_item.title,
      author: shopping_item.author,
      campus_id: campus_response.object.id,
      quantity: 0,
    };

    return await this.restockListDao.addRestockListItem(restock_item);
  }

  public async getRestockListForCampus(
    campus_name: string
  ): Promise<Response<Campus | RestockList[]>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.restockListDao.getAllByKeyAndValue(
      "campus_id",
      campus_response.object.id.toString()
    );
  }

  public async deleteRestockListItem(
    book_id: number,
    campus_name: string
  ): Promise<Response<Campus | RestockList>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.restockListDao.deleteRestockListItem(book_id, campus_response.object.id);
  }

  public async getAllAudits(campus_name: string): Promise<Response<Audit[] | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.auditDao.getAllByKeyAndValue("campus_id", campus_response.object.id);
  }

  public async getAuditReport(audit_id: number): Promise<Response<any>> {
    return await this.auditEntryDao.getAuditReport(audit_id);
  }
}
