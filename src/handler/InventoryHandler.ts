import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";

import BookManagementService from "../service/BookManagementService";
import { isValidISBN, sanitizeISBN, parseQr } from "../utils/utils";

export class InventoryHandler {
  private bookManagementService: BookManagementService;

  constructor(bookManagementService: BookManagementService) {
    this.bookManagementService = bookManagementService;
  }

  public async getTagsByIsbn(params: any) {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to get its book tags", 400);
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

    return this.bookManagementService.removeBookByIsbn(sanitizeISBN(params.isbn));
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

  public async getQuantities(bookId: number): Promise<Response<any>> {
    if (bookId != null) {
      return this.bookManagementService.getQuantities(bookId);
    } else {
      return new RequestErrorResponse("Missing Book Id");
    }
  }
}
