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

    const shopping_response = await this.reportService.getShoppingListForCampus(
      authData.userRole?.campus
    );
    return shopping_response;
  }

  public async deleteShoppingListItem(body, authData): Promise<Response<Campus | ShoppingList>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.book_id) {
      return new RequestErrorResponse("Request is missing book_id", 400);
    }

    const delete_response = await this.reportService.deleteShoppingListItem(
      body.book_id,
      authData.userRole?.campus
    );
    return delete_response;
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

    const response = await this.reportService.moveShoppingItemToRestock(
      body.book_id,
      authData.userRole?.campus
    );
    return response;
  }

  public async getRestockList(authData): Promise<Response<Campus | RestockList[]>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    const restock_response = await this.reportService.getRestockListForCampus(
      authData.userRole?.campus
    );
    return restock_response;
  }

  public async deleteRestockListItem(body, authData): Promise<Response<Campus | RestockList>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.book_id) {
      return new RequestErrorResponse("Request is missing book_id", 400);
    }

    const delete_response = await this.reportService.deleteRestockListItem(
      body.book_id,
      authData.userRole?.campus
    );
    return delete_response;
  }
}
