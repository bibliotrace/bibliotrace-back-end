import RequestErrorResponse from "../db/response/RequestErrorResponse";
import SuccessResponse from "../db/response/SuccessResponse";
import CheckoutService from "../service/CheckoutService";

export class CheckoutHandler {
  checkoutService: CheckoutService;

  constructor(checkoutService: CheckoutService) {
    this.checkoutService = checkoutService;
  }

  public async checkout(body) {
    if (!body.qr_code) {
      return new RequestErrorResponse("QR code is required", 400);
    }
    if (!body.campus) {
      return new RequestErrorResponse("Campus is required", 400);
    }

    const [response, book_obj] = await this.checkoutService.checkout(
      body.qr_code,
      body.campus
    );

    if (response.statusCode !== 200) {
      return response;
    }
    return new SuccessResponse("Checked out successfully", {
      title: book_obj.book_title,
      author: book_obj.author,
      isbn: book_obj.isbn_list,
    });
  }

  public async checkin(body) {
    if (!body.qr_code) {
      return new RequestErrorResponse("QR code is required", 400);
    }
    if (!body.campus) {
      return new RequestErrorResponse("Campus is required", 400);
    }

    const [response, book_obj] = await this.checkoutService.checkin(
      body.qr_code,
      body.campus
    );

    if (response.statusCode !== 200) {
      return response;
    }
    return new SuccessResponse("Checked in successfully", {
      title: book_obj.book_title,
      author: book_obj.author,
      isbn: book_obj.isbn_list,
    });
  }
}
