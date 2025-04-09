import RequestErrorResponse from "../response/RequestErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import CheckoutService from "../service/CheckoutService";
import { parseQr, parseRequiredFields } from "../utils/utils";

export class CheckoutHandler {
  checkoutService: CheckoutService;

  constructor(checkoutService: CheckoutService) {
    this.checkoutService = checkoutService;
  }

  public async checkout(body, authData) {
    const requiredFields = ["qr_code"];
    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    const qrResponse = parseQr(body.qr_code);
    if (qrResponse) return qrResponse;

    const campus = authData.userRole.campus;

    if (campus == null) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }

    const [response, book_obj] = await this.checkoutService.checkout(body.qr_code, campus);
    response.object = book_obj;
    return response;
  }

  public async checkin(body, authData) {
    const requiredFields = ["qr_code"];
    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    const qrResponse = parseQr(body.qr_code);
    if (qrResponse) return qrResponse;

    const campus = authData.userRole.campus;
    if (campus == null) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }

    const [response, book_obj] = await this.checkoutService.checkin(body.qr_code, campus);
    response.object = book_obj;
    return response;
  }

  public async addBookToInventory(body, authData) {
    const requiredFields = ["isbn", "location_id", "qr"];
    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    const qrResponse = parseQr(body.qr);
    if (qrResponse) return qrResponse;

    const campus = authData.userRole.campus;
    if (campus == null) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }

    const response = await this.checkoutService.addBook(
      body.qr,
      body.location_id,
      campus,
      body.isbn
    );

    if (response.statusCode !== 200) {
      return response;
    }
    return new SuccessResponse("Added Book Successfully", {
      title: response.object.book_title,
      author: response.object.author,
      isbn: response.object.isbn_list,
    });
  }
}
