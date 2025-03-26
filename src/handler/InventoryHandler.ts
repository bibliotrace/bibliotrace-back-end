import RequestErrorResponse from "../response/RequestErrorResponse";
import BookManagementService, {
  BookInsertRequest,
} from "../service/BookManagementService";
import IsbnService from "../service/IsbnService";
import {
  isValidISBN,
  parseQr,
  parseRequiredFields
} from "../utils/utils";

export class InventoryHandler {
  private bookManagementService: BookManagementService;
  private isbnService: IsbnService;

  constructor(bookManagementService: BookManagementService, isbnService: IsbnService) {
    this.bookManagementService = bookManagementService;
    this.isbnService = isbnService;
  }

  public async insertBook(body) {
    const request = this.parseInsertRequest(body);
    if (request instanceof RequestErrorResponse) {
      return request;
    }

    return this.bookManagementService.insertBook(request as BookInsertRequest);
  }

  // This function will create a new book from scratch
  public async createBook() {
    // TODO: split out and use the create portion of the insertBook function 
  }

  //This function will just update a books' metadata
  public async updateBook() {
    // TODO: split out and use the update portion of the insertBook function 
  }

  public async getTagsByIsbn(params: any) {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to get its book tags", 400);
    } else if (!isValidISBN(params.isbn)) {
      return new RequestErrorResponse("Invalid ISBN provided", 400);
    }

    return this.bookManagementService.getTagsByIsbn(params.isbn);
  }

  private parseInsertRequest(body): RequestErrorResponse | BookInsertRequest {
    const qrResponse = parseQr(body.qr);
    if (qrResponse instanceof RequestErrorResponse) {
      return qrResponse;
    }

    const requiredFields = [
      "book_title",
      "author",
      "primary_genre",
      "audience",
      "qr",
      "location_id",
      "campus",
    ];

    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    const bookRequest: BookInsertRequest = {
      book_title: body.book_title,
      author: body.author,
      primary_genre: body.primary_genre,
      audience: body.audience,
      qr: body.qr,
      location_id: body.location_id,
      campus: body.campus,
    };

    // not required as not every book has a usable ISBN
    if (body.isbn) {
      bookRequest.isbn = body.isbn;
    }

    if (body.pages) {
      bookRequest.pages = body.pages;
    }

    if (body.series_name) {
      bookRequest.series_name = body.series_name;
    }

    if (body.series_number) {
      if (body.series_number < 1) {
        return new RequestErrorResponse("Series number must be a positive integer");
      }
      bookRequest.series_number = body.series_number;
    }

    if (body.publish_date) {
      bookRequest.publish_date = body.publish_date;
    }

    if (body.short_description) {
      bookRequest.short_description = body.short_description;
    }

    if (body.language) {
      bookRequest.language = body.language;
    }

    if (body.img_callback) {
      bookRequest.img_callback = body.img_callback;
    }

    return bookRequest;
  }
}
