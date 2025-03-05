import RequestErrorResponse from "../response/RequestErrorResponse";
import BookManagementService, { BookInsertRequest } from "../service/BookManagementService";

export class InventoryHandler {
  private bookManagementService: BookManagementService;

  constructor(bookManagementService: BookManagementService) {
    this.bookManagementService = bookManagementService;
  }

  public async insertBook(body) {
    const request = this.parseInsertRequest(body);
    if (request instanceof RequestErrorResponse) {
      return request;
    }

    return this.bookManagementService.insertBook(request as BookInsertRequest);
  }

  public async getByIsbn(params: any) {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to get a book", 400);
    } else if (!this.isValidISBN(params.isbn)) {
      // isbn not included in response message as it can overflow the error modal lol
      return new RequestErrorResponse(`Invalid ISBN provided`, 400);
    }

    return this.bookManagementService.getByIsbn(this.sanitizeISBN(params.isbn));
  }

  private isValidISBN(isbn: string): boolean {
    const isbnClean = isbn.replace(/[-\s]/g, ""); // Remove hyphens and spaces

    // Check if ISBN is ISBN-10
    if (isbnClean.length === 10) {
      const checkSum = isbnClean.split("").reduce((sum, char, index) => {
        const digit = char === "X" ? 10 : parseInt(char, 10);
        return sum + digit * (10 - index);
      }, 0);
      return checkSum % 11 === 0;
    }

    // Check if ISBN is ISBN-13
    if (isbnClean.length === 13) {
      const checkSum = isbnClean.split("").reduce((sum, char, index) => {
        const digit = parseInt(char, 10);
        return sum + (index % 2 === 0 ? digit : digit * 3);
      }, 0);
      return checkSum % 10 === 0;
    }

    return false; // Not a valid ISBN length
  }

  private sanitizeISBN(isbn: string): string {
    return isbn.replace(/[-\s]/g, "");
  }

  private parseInsertRequest(body): RequestErrorResponse | BookInsertRequest {
    const qrResponse = this.parseQr(body.qr);
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
    for (const field of requiredFields) {
      if (body[field] == null) {
        return new RequestErrorResponse(
          `Required field ${field} missing in book modification request`,
          400
        );
      }
    }

    const bookRequest: BookInsertRequest = {
      book_title: body.book_title,
      author: body.author,
      primary_genre: body.primary_genre,
      audience: body.audience,
      qr: body.qr,
      location_id: body.location_id,
      campus: body.campus,
    };

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
        return new RequestErrorResponse("Series number must be a positive integer", 400);
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

  private parseQr(qr: string) {
    // TODO: figure out how the Access QR code is generated, this is just a placeholder
    if (
      !qr ||
      qr.length !== 6 ||
      !this.isAlphanumeric(qr) ||
      !this.isAlpha(qr.substring(0, 2)) ||
      !this.isNumeric(qr.substring(2))
    ) {
      return new RequestErrorResponse("Invalid QR code provided", 400);
    }
  }

  private isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  private isAlpha(str: string): boolean {
    return /^[a-zA-Z]+$/.test(str);
  }

  private isNumeric(str: string): boolean {
    return /^[0-9]+$/.test(str);
  }
}
