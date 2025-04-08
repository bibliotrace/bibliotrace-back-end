import RequestErrorResponse from "../response/RequestErrorResponse";
import BookManagementService from "../service/BookManagementService";
import IsbnService from "../service/IsbnService";
import { isValidISBN, parseQr } from "../utils/utils";

export class InventoryHandler {
  private bookManagementService: BookManagementService;

  constructor(bookManagementService: BookManagementService, isbnService: IsbnService) {
    this.bookManagementService = bookManagementService;
  }

  public async getTagsByIsbn(params: any) {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to get its book tags", 404);
    } else if (!isValidISBN(params.isbn)) {
      return new RequestErrorResponse("Invalid ISBN provided", 400);
    }

    return this.bookManagementService.getTagsByIsbn(params.isbn);
  }

  public async removeBookByIsbn(params: any) {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to remove a book", 404);
    } else if (!isValidISBN(params.isbn)) {
      return new RequestErrorResponse("Invalid ISBN provided");
    }

    return this.bookManagementService.removeBookByIsbn(params.isbn);
  }

  public async removeBookByQr(params: any) {
    if (!params.qr) {
      return new RequestErrorResponse("QR code is required to remove a book", 404);
    } else {
      const qrResponse = parseQr(params.qr);
      if (qrResponse) {
        return new RequestErrorResponse("Invalid QR code provided");
      }
    }

    return this.bookManagementService.removeBookByQr(params.qr);
  }
}
