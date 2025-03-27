import RequestErrorResponse from "../response/RequestErrorResponse";
import BookManagementService from "../service/BookManagementService";
import IsbnService from "../service/IsbnService";
import {
  isValidISBN
} from "../utils/utils";

export class InventoryHandler {
  private bookManagementService: BookManagementService;
  private isbnService: IsbnService;

  constructor(bookManagementService: BookManagementService, isbnService: IsbnService) {
    this.bookManagementService = bookManagementService;
    this.isbnService = isbnService;
  }

  public async getTagsByIsbn(params: any) {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to get its book tags", 400);
    } else if (!isValidISBN(params.isbn)) {
      return new RequestErrorResponse("Invalid ISBN provided", 400);
    }

    return this.bookManagementService.getTagsByIsbn(params.isbn);
  }
}
