import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import { Campus } from "../db/schema/Campus";
import ReportService from "../service/ReportService";
import { ShoppingList } from "../db/schema/ShoppingList";
import { RestockList } from "../db/schema/RestockList";

export default class ReportHandler {
  reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  public async getShoppingList(authData): Promise<Response<Campus | ShoppingList[]>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }

    return await this.reportService.getShoppingListForCampus(authData.userRole?.campus);
  }

  public async deleteShoppingListItem(body, authData): Promise<Response<Campus | ShoppingList>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.book_id) {
      return new RequestErrorResponse("Request is missing book_id", 400);
    }

    return await this.reportService.deleteShoppingListItem(body.book_id, authData.userRole?.campus);
  }

  public async moveShoppingItemToRestock(
    body,
    authData
  ): Promise<Response<Campus | ShoppingList | RestockList>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.book_id) {
      return new RequestErrorResponse("Request is missing book_id", 400);
    }

    return await this.reportService.moveShoppingItemToRestock(
      body.book_id,
      authData.userRole?.campus
    );
  }

  public async getRestockList(authData): Promise<Response<Campus | RestockList[]>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    return await this.reportService.getRestockListForCampus(authData.userRole?.campus);
  }

  public async deleteRestockListItem(body, authData): Promise<Response<Campus | RestockList>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.book_id) {
      return new RequestErrorResponse("Request is missing book_id", 400);
    }

    return await this.reportService.deleteRestockListItem(body.book_id, authData.userRole?.campus);
  }
}
