import { Book } from "../db/schema/Book";
import { Campus } from "../db/schema/Campus";
import { Checkout } from "../db/schema/Checkout";
import { Inventory } from "../db/schema/Inventory";
import Response from "../db/response/Response";
import SuccessResponse from "../db/response/SuccessResponse";
import Service from "./Service";
import DaoFactory from "../db/dao/DaoFactory";

const MAX_TTL = 60 * 24 * 7; // 1 week in minutes

export default class BookManagementService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async getByIsbn(isbn: string): Promise<Response<Book>> {
    return this.bookDao.getBookByIsbn(isbn);
  }

  public async insertBook(request: BookInsertRequest) {
    // check ISBN first because it's faster to match on than book name string
    let bookResponse;
    if (request.isbn) {
      bookResponse = await this.bookDao.getBookByIsbn(request.isbn);
      if (bookResponse.statusCode !== 200) {
        bookResponse = await this.bookDao.getBookByName(request.name);
      }
    } else {
      bookResponse = await this.bookDao.getBookByName(request.name);
    }

    if (bookResponse.statusCode === 500) {
      // book does not already exist in book table
      bookResponse = await this.parseBook(request);
      if (bookResponse.statusCode != 200) {
        return bookResponse;
      }

      const response = await this.bookDao.create(bookResponse.object);
      if (response.statusCode != 200) {
        return response;
      }
    }

    const inventoryParseResponse = await this.parseInventory(
      request,
      bookResponse.object.id
    );
    if (inventoryParseResponse.statusCode != 200) {
      return inventoryParseResponse;
    }

    const inventoryResponse = (await this.inventoryDao.create(
      inventoryParseResponse.object as Inventory
    )) as Response<Inventory>;
    if (inventoryResponse.statusCode != 200) {
      return inventoryResponse;
    }

    const checkout: Checkout = {
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "), // TODO: make sure this matches what MySQL expects
      qr: inventoryResponse.object.qr,
      book_id: bookResponse.object.id,
      state: "First",
    };

    const checkoutResponse = await this.checkoutDao.create(checkout);
    if (checkoutResponse.statusCode != 200) {
      return checkoutResponse;
    }

    return new SuccessResponse(
      `Book ${bookResponse.object.book_title} successfully created`
    );
  }

  private async parseBook(bookRequest: BookInsertRequest) {
    // TODO: there has GOT to be some way to store the id mappings for the audiences and genres somewhere cause querying every time is dumb
    // if the front end can store the raw id mappings, then we can just send the id mappings to the back end and save some pain
    const genreIdResponse = await this.genreTypeDao.getAllMatchingOnIndex(
      "genre_name",
      bookRequest.primary_genre
    );
    if (genreIdResponse.statusCode !== 200) {
      return genreIdResponse;
    }
    const primary_genre_id = genreIdResponse.object[0].id;

    const audienceIdResponse = await this.audienceDao.getAllMatchingOnIndex(
      "audience_name",
      bookRequest.audience
    );
    if (audienceIdResponse.statusCode !== 200) {
      return audienceIdResponse;
    }
    const audience_id = audienceIdResponse.object[0].id;

    const book: Book = {
      book_title: bookRequest.name,
      isbn_list: bookRequest.isbn,
      author: bookRequest.author,
      primary_genre_id: primary_genre_id,
      audience_id: audience_id,
    };

    if (bookRequest.pages) {
      book.pages = bookRequest.pages;
    }
    if (bookRequest.series_name) {
      const seriesResponse = await this.seriesDao.getByKeyAndValue(
        "series_name",
        bookRequest.series_name
      );
      if (seriesResponse.statusCode !== 200) {
        return seriesResponse;
      }
      book.series_id = seriesResponse.object.id;
    }
    if (bookRequest.series_number) {
      book.series_number = bookRequest.series_number;
    }
    if (bookRequest.publish_date) {
      book.publish_date = bookRequest.publish_date;
    }
    if (bookRequest.short_description) {
      book.short_description = bookRequest.short_description;
    }
    if (bookRequest.language) {
      book.language = bookRequest.language;
    }
    if (bookRequest.img_callback) {
      book.img_callback = bookRequest.img_callback;
    }

    return new SuccessResponse<Book>("Successfully parsed book", book);
  }

  private async parseInventory(
    request: BookInsertRequest,
    book_id: number
  ): Promise<Response<Campus | Inventory>> {
    // again, find some way to store the campus ID mapping to avoid needing this query
    const campusResponse = await this.campusDao.getByKeyAndValue(
      "campus_name",
      request.campus
    );
    if (campusResponse.statusCode !== 200) {
      return campusResponse;
    }
    const campus_id = campusResponse.object.id;

    const inventory: Inventory = {
      qr: request.qr,
      book_id: book_id,
      location_id: request.location_id,
      campus_id: campus_id,
      ttl: MAX_TTL,
    };

    return new SuccessResponse<Inventory>("Successfully parsed inventory", inventory);
  }
}

export interface BookInsertRequest {
  id?: number;
  name: string;
  isbn?: string; // this unfortunately needs to be optional because some ISBNs have been obscured or are illegible
  author: string;
  primary_genre: string;
  audience: string;
  pages?: number;
  series_name?: string;
  series_number?: number;
  publish_date?: number;
  short_description?: string;
  language?: string;
  img_callback?: string;
  qr: string;
  location_id: number;
  campus: string;
}
