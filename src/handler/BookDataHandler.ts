import RequestErrorResponse from "../response/RequestErrorResponse";
import BookManagementService from "../service/BookManagementService";
import IsbnService from "../service/IsbnService";
import { isValidISBN, sanitizeISBN } from "../utils/utils";

export default class BookDataHandler {
  private bookManagementService: BookManagementService;
  private isbnService: IsbnService

  constructor(bookManagementService: BookManagementService, isbnService: IsbnService) {
    this.bookManagementService = bookManagementService;
    this.isbnService = isbnService;
  }

  // This function will get all book metadata for a given book
  // Respond with a 404 not found if the book isn't in the system yet
  public async getByIsbn(isbnString: string) {
    if (!isbnString) {
      return new RequestErrorResponse(
        "ISBN is required to search for book information",
        400
      );
    }
    if (!isValidISBN(isbnString)) {
      // isbn not included in response message as it can overflow the error modal lol
      return new RequestErrorResponse(`Invalid ISBN provided`, 400);
    }

    const localData = await this.bookManagementService.getByIsbn(
      sanitizeISBN(isbnString)
    );

    return localData;
  }

  // This function will get a suggestion for book data from the ISBNdb API.
  // This responds with a 404 if the book isn't found
  public async getIsbnDbSuggestion(isbnString: string, authRole: string) {
    if (!isbnString) {
      return new RequestErrorResponse(
        "ISBN is required to search for book information",
        400
      ); 
    }
    if (!isValidISBN(isbnString)) {
      // isbn not included in response message as it can overflow the error modal lol
      return new RequestErrorResponse(`Invalid ISBN provided`, 400);
    }
    if (authRole != 'Admin') {
      return new RequestErrorResponse('ISBNdb Access Restricted to Admins', 401)
    }

    return await this.isbnService.retrieveMetadata(isbnString)
  }

  // This function will take an object for book data and update it in the db
  // This responds with a 401 if the request isn't made by an admin
  public async updateBook(book: any, authRole: string) {
    if (authRole != 'Admin') {
      return new RequestErrorResponse('Admin User Type Required', 401)
    }
    console.log(book);
    if (book.book_title == null || book.isbn_list == null || book.primary_genre_name == null) {
      return new RequestErrorResponse('Missing book title, isbn_list, and/or primary_genre', 400)
    }
    
    return await this.bookManagementService.updateBook(book)
  }

}