import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import BookManagementService from "../service/BookManagementService";
import IsbnService from "../service/IsbnService";
import { isValidISBN, parseQr, sanitizeISBN } from "../utils/utils";

export default class BookDataHandler {
  private bookManagementService: BookManagementService;
  private isbnService: IsbnService;

  constructor(bookManagementService: BookManagementService, isbnService: IsbnService) {
    this.bookManagementService = bookManagementService;
    this.isbnService = isbnService;
  }

  public async getBackLogBook() {
    const localData = await this.bookManagementService.getBacklogBook();
    return localData;
  }
  // This function will get all book metadata for a given book
  // Respond with a 404 not found if the book isn't in the system yet
  public async getByIsbn(isbnString: string) {
    if (!isbnString) {
      return new RequestErrorResponse("ISBN is required to search for book information", 400);
    }
    if (!isValidISBN(isbnString)) {
      // isbn not included in response message as it can overflow the error modal lol
      return new RequestErrorResponse(`Invalid ISBN provided`, 400);
    }

    const localData = await this.bookManagementService.getByIsbn(sanitizeISBN(isbnString));

    return localData;
  }

  public async getByQr(qrString: string) {
    if (!qrString) {
      return new RequestErrorResponse("QR code is required to search for book information", 400);
    }

    const qrResponse = parseQr(qrString);
    if (qrResponse) return qrResponse;

    const localData = await this.bookManagementService.getByQr(qrString);

    return localData;
  }

  public async getById(id: number) {
    if (typeof id !== "number" || Number.isNaN(id) || id <= 0) {
      return new RequestErrorResponse("Valid ID is required to search for book information", 400);
    }

    const localData = await this.bookManagementService.getById(id);

    return localData;
  }


  // This function will get a suggestion for book data from the ISBNdb API.
  // This responds with a 404 if the book isn't found
  public async getIsbnDbSuggestion(isbnString: string, authRole: string) {
    if (!isbnString) {
      return new RequestErrorResponse("ISBN is required to search for book information", 400);
    }
    if (!isValidISBN(isbnString)) {
      // isbn not included in response message as it can overflow the error modal lol
      return new RequestErrorResponse(`Invalid ISBN provided`, 400);
    }
    if (authRole != "Admin") {
      return new RequestErrorResponse("ISBNdb access restricted to admins", 401);
    }

    return await this.isbnService.retrieveMetadata(isbnString);
  }
  // This function will take an object for book data and update it in the db
  // This responds with a 401 if the request isn't made by an admin
  public async updateBackLogBook(book: any, authRole: string) {
    if (authRole != "Admin") {
      return new RequestErrorResponse("Admin user type required", 401);
    }
    if (!book.book_title || !book.isbn_list || !book.primary_genre_name || !book.location || !book.audience_name) {
      return new RequestErrorResponse("Missing book title, isbn_list, location, audience name and/or primary_genre", 400);
    }

    if (book.primary_genre_name == 'Unknown' || book.audience_name == 'Unknown' || book.location == 'Unknown') {
      return new RequestErrorResponse("primary genre, audience name, and/or location cant be unknown", 400);
    }
    return await this.bookManagementService.updateBackLogBook(book);
  }


  // This function will take an object for book data and update it in the db
  // This responds with a 401 if the request isn't made by an admin
  public async updateBook(book: any, authRole: string) {
    if (authRole != "Admin") {
      return new RequestErrorResponse("Admin user type required", 401);
    }
    if (!book.book_title || !book.isbn_list || !book.primary_genre_name) {
      return new RequestErrorResponse("Missing book title, isbn_list, and/or primary_genre", 400);
    }

    return await this.bookManagementService.createOrUpdateBookData(book);
  }

  public async addGenreToBook(
    genreString: string,
    isbn: string,
    authRole: string
  ): Promise<Response<any>> {
    if (authRole != "Admin") {
      return new RequestErrorResponse("Admin user type required", 401);
    }
    return await this.bookManagementService.addGenreToBook(genreString, isbn);
  }

  public async deleteGenreFromBook(
    genreString: string,
    isbn: string,
    authRole: string
  ): Promise<Response<any>> {
    if (authRole != "Admin") {
      return new RequestErrorResponse("Admin user type required", 401);
    }
    return await this.bookManagementService.deleteGenreFromBook(genreString, isbn);
  }

  public async addTagToBook(
    tagString: string,
    isbn: string,
    authRole: string
  ): Promise<Response<any>> {
    if (authRole != "Admin") {
      return new RequestErrorResponse("Admin user type required", 401);
    }
    return await this.bookManagementService.addTagToBook(tagString, isbn);
  }

  public async deleteTagFromBook(
    tagString: string,
    isbn: string,
    authRole: string
  ): Promise<Response<any>> {
    if (authRole != "Admin") {
      return new RequestErrorResponse("Admin user type required", 401);
    }
    return await this.bookManagementService.deleteTagFromBook(tagString, isbn);
  }
}
