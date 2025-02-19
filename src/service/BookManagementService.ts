import AudienceDao from "../db/dao/AudienceDao";
import BookDao from "../db/dao/BookDao";
import CampusDao from "../db/dao/CampusDao";
import CheckoutDao from "../db/dao/CheckoutDao";
import GenreTypeDao from "../db/dao/GenreTypeDao";
import InventoryDao from "../db/dao/InventoryDao";
import SeriesDao from "../db/dao/SeriesDao";
import { Book } from "../db/schema/Book";
import { Checkout } from "../db/schema/Checkout";
import { Inventory } from "../db/schema/Inventory";
import Response from "../db/response/Response";
import RequestErrorResponse from "../db/response/RequestErrorResponse";
import ServerErrorResponse from "../db/response/ServerErrorResponse";
import SuccessResponse from "../db/response/SuccessResponse";

const MAX_TTL = 60 * 24 * 7; // 1 week in minutes

export default class BookManagementService {
  private audienceDao: AudienceDao;
  private bookDao: BookDao
  private campusDao: CampusDao;
  private checkoutDao: CheckoutDao;
  private genreTypeDao: GenreTypeDao;
  private inventoryDao: InventoryDao;
  private seriesDao: SeriesDao;

  constructor(audienceDao: AudienceDao, bookDao: BookDao, campusDao: CampusDao, checkoutDao: CheckoutDao, genreTypeDao: GenreTypeDao, inventoryDao: InventoryDao, seriesDao: SeriesDao) {
    this.audienceDao = audienceDao;
    this.bookDao = bookDao;
    this.campusDao = campusDao;
    this.checkoutDao = checkoutDao;
    this.genreTypeDao = genreTypeDao;
    this.inventoryDao = inventoryDao;
    this.seriesDao = seriesDao;
  } 

  public async getByIsbn(isbn: string): Promise<Response<Book>> {
    return this.bookDao.getBookByIsbn(isbn);
  }

  public async insertBook(req: any): Promise<Response<Book | Inventory>> {
    let bookResponse = await this.bookDao.getBookByIsbn(req.body.isbn);
    if (bookResponse.statusCode === 500) {
      bookResponse = await this.bookDao.getBookByName(req.body.name);
    }

    if (bookResponse.statusCode === 500) {
      // book does not already exist in book table
      bookResponse = await this.parseBook(req);
      if (bookResponse.statusCode != 200) {
        return bookResponse;
      }

      const response = await this.bookDao.create(bookResponse.object);
      if (response.statusCode != 200) {
        return response;
      }
    }

    let inventoryResponse = await this.parseInventory(req, bookResponse.object.id);
    if (inventoryResponse.statusCode != 200) {
      return inventoryResponse;
    }

    try {
      await this.inventoryDao.create(inventoryResponse.object);
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to create inventory item with error ${error}`,
        500
      );
    }

    const checkout: Checkout = {
      timestamp: new Date().toISOString(), // TODO: make sure this matches what MySQL expects
      qr: inventoryResponse.object.qr,
      book_id: bookResponse.object.id,
      state: "First",
    };

    try {
      await this.checkoutDao.create(checkout);
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to create first checkout item with error ${error}`,
        500
      );
    }

    return new SuccessResponse<Book | Inventory>("Book successfully created");
  }

  private async parseBook(req: any): Promise<Response<Book>> {
    const requiredFields = ["isbn", "name", "author", "primary_genre", "audience"];
    for (const field of requiredFields) {
      if (req.body[field] == null) {
        return new RequestErrorResponse(
          `Missing required field ${field} for book in request body`,
          400
        );
      }
    }

    // TODO: there has GOT to be some way to store the id mappings for the audiences and genres somewhere cause querying every time is dumb
    // if the front end can store the raw id mappings, then we can just send the id mappings to the back end and save some pain
    let primary_genre_id: number;
    try {
      primary_genre_id = (
        await this.genreTypeDao.getAllMatchingOnIndex("name", req.body.primary_genre)
      ).object[0].id;
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve primary genre id with error ${error}`,
        500
      );
    }

    let audience_id: number;
    try {
      audience_id = (
        await this.audienceDao.getAllMatchingOnIndex("name", req.body.audience)
      ).object[0].id;
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve audience id with error ${error}`,
        500
      );
    }

    const book: Book = {
      book_title: req.body.name,
      isbn_list: req.body.isbn,
      author: req.body.author,
      primary_genre_id: primary_genre_id,
      audience_id: audience_id,
    };

    if (req.body.pages) {
      book.pages = req.body.pages;
    }
    if (req.body.series_name) {
      try {
        const series_id = (
          await this.seriesDao.getAllMatchingOnIndex("series_name", req.body.series_name)
        ).object[0].id;
        book.series_id = series_id;
      } catch (error) {
        return new ServerErrorResponse(
          `Failed to retrieve series id with error ${error}`,
          500
        );
      }
    }
    if (req.body.series_number) {
      book.series_number = req.body.series_number;
    }
    if (req.body.publish_date) {
      book.publish_date = req.body.publish_date;
    }
    if (req.body.short_description) {
      book.short_description = req.body.short_description;
    }
    if (req.body.language) {
      book.language = req.body.language;
    }
    if (req.body.img_callback) {
      book.img_callback = req.body.img_callback;
    }

    return new SuccessResponse<Book>("Successfully parsed book", book);
  }

  private async parseInventory(req: any, book_id: number): Promise<Response<Inventory>> {
    const requiredFields = ["qr", "location", "campus"];
    for (const field of requiredFields) {
      if (req.body[field] == null) {
        return new RequestErrorResponse(
          `Missing required field ${field} for inventory in request body`,
          400
        );
      }
    }

    // again, find some way to store the campus ID mapping to avoid needing this query
    try {
      req.body.campus_id = (
        await this.campusDao.getAllMatchingOnIndex("name", req.body.campus)
      ).object[0].id;
    } catch (error) {
      return new ServerErrorResponse(
        `Failed to retrieve campus id with error ${error}`,
        500
      );
    }

    const inventory: Inventory = {
      qr: req.body.qr,
      book_id: book_id,
      location: req.body.location,
      campus_id: req.body.campus_id,
      ttl: MAX_TTL,
    };

    return new SuccessResponse<Inventory>("Successfully parsed inventory", inventory);
  }
}
