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

    return await this.shoppingListDao.getShoppingList(campus_response.object.id);
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

    return await this.restockListDao.getRestockList(campus_response.object.id);
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

    return await this.auditDao.getAuditListReport(campus_response.object.id);
  }

  public async getAuditReport(audit_id: number): Promise<Response<any>> {
    return await this.auditEntryDao.getAuditReport(audit_id);
  }

  public async getPopularReport(
    campus_name: string,
    start_date: string,
    end_date: string
  ): Promise<Response<any>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.bookDao.getPopular(campus_response.object.id, start_date, end_date);
  }

  public async getStockReport(campus_name: string): Promise<Response<any>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.inventoryDao.getStock(campus_response.object.id);
  }
}
