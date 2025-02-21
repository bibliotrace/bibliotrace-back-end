import RequestErrorResponse from "../db/response/RequestErrorResponse";
import BookManagementService, {
  BookInsertRequest,
} from "../service/BookManagementService";
import Response from "../db/response/Response";

export class InventoryHandler {
  private bookManagementService: BookManagementService;

  constructor(bookManagementService: BookManagementService) {
    this.bookManagementService = bookManagementService;
  }

  public async insertBook(body: any): Promise<Response<any>> {
    if (!body.isbn || !body.name) {
      return new RequestErrorResponse("ISBN or name is required to insert a book", 400);
    }

    const request = this.parseInsertRequest(body);
    if (request instanceof RequestErrorResponse) {
      return request;
    }

    return this.bookManagementService.insertBook(request as BookInsertRequest);
  }

  public async getByIsbn(params: any): Promise<Response<any>> {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to get a book", 400);
    }

    return this.bookManagementService.getByIsbn(params.isbn);
  }

  private parseInsertRequest(body: any): RequestErrorResponse | BookInsertRequest {
    const requiredFields = [
      "name",
      "author",
      "primary_genre",
      "audience",
      "qr",
      "location",
      "campus",
    ];
    for (const field of requiredFields) {
      if (body[field] == null) {
        return new RequestErrorResponse(
          `Missing required field ${field} for book in insertion request body`,
          400
        );
      }
    }

    let bookRequest: BookInsertRequest = {
      name: body.name,
      author: body.author,
      primary_genre: body.primary_genre,
      audience: body.audience,
      qr: body.qr,
      location: body.location,
      campus: body.campus,
    };

    if (body.id) {
      bookRequest.id = body.id;
    }

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
