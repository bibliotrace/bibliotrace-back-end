import { Book } from "../db/schema/Book";
import { Campus } from "../db/schema/Campus";
import { Checkout } from "../db/schema/Checkout";
import { Inventory } from "../db/schema/Inventory";
import Response from "../response/Response";
import SuccessResponse from "../response/SuccessResponse";
import Service from "./Service";
import DaoFactory from "../db/dao/DaoFactory";
import ServerErrorResponse from "../response/ServerErrorResponse";
import { Genre } from "../db/schema/Genre";
import { Audience } from "../db/schema/Audience";
import RequestErrorResponse from "../response/RequestErrorResponse";

const MAX_TTL = 60 * 24 * 7; // 1 week in minutes

export default class BookManagementService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async getByIsbn(isbn: string): Promise<Response<Book>> {
    // Pull basic book data in a large base query
    const bookDataResponse = (await this.bookDao.getBookByIsbn(isbn)) as Response<any>;
    if (bookDataResponse.statusCode === 200 && bookDataResponse.object != null) {
      // Pull external genres and tags to add to the book
      const genresResponse = await this.bookGenreDao.getGenresByBookId(bookDataResponse.object.id);
      if (genresResponse.statusCode === 200 && genresResponse.object != null) {
        bookDataResponse._object.genre_list = genresResponse.object;
      }

      const tagsResponse = await this.bookTagDao.getTagsByBookId(bookDataResponse.object.id);
      if (tagsResponse.statusCode === 200 && tagsResponse.object != null) {
        bookDataResponse._object.tag_list = tagsResponse.object;
      }
    }

    return bookDataResponse;
  }

  public async getByQr(qr: string): Promise<Response<any>> {
    return await this.inventoryDao.getBookDataFromQr(qr);
  }

  public async setLocationByQr(qr: string, location: number): Promise<Response<any>> {
    return await this.inventoryDao.setLocation(qr, location);
  }

  public async getByTitle(title: string): Promise<Response<Book>> {
    return await this.bookDao.getBookByName(title);
  }

  public async getTagsByIsbn(isbn: string): Promise<Response<any>> {
    return await this.bookDao.getBookTagsByIsbn(isbn);
  }

  public async updateBook(request: any): Promise<Response<any>> {
    const title = request.book_title;
    const isbn_list = request.isbn_list;
    const author = request.author;
    const primary_genre_name = request.primary_genre_name;
    const audience_name = request.audience_name;
    const pages = request.pages;
    const series_name = request.series_name;
    const series_number = request.series_number;
    const publish_date = request.publish_date;
    const short_description = request.short_description;
    const language = request.language;
    const img_callback = request.img_callback;

    // Get ids for reference names
    let primary_genre_id, audience_id, series_id;
    const genreResponse = await this.genreDao.getByKeyAndValue("genre_name", primary_genre_name);
    if (genreResponse == null || genreResponse.statusCode != 200) {
      return genreResponse;
    } else if (genreResponse.object == null) {
      return new RequestErrorResponse("Primary Genre ID Not Found", 404);
    } else {
      primary_genre_id = genreResponse.object.id;
    }
    const audienceResponse = await this.audienceDao.getByKeyAndValue("audience_name", audience_name);
    if (audienceResponse == null || audienceResponse.statusCode != 200) {
      return audienceResponse;
    } else if (audienceResponse.object == null) {
      return new RequestErrorResponse("Audience ID Not Found", 404);
    } else {
      audience_id = audienceResponse.object.id;
    }
    const seriesResponse = await this.seriesDao.getByKeyAndValue("series_name", series_name);
    if (seriesResponse != null && seriesResponse.statusCode != 200) {
      return seriesResponse;
    } else if (seriesResponse.object != null) {
      series_id = seriesResponse.object.id;
    }

    if (primary_genre_id == null || audience_id == null) {
      return new RequestErrorResponse("Primary Genre and Audience Required, but Not Found", 400);
    }

    const bookResponse = await this.getByTitle(title);

    if (bookResponse.statusCode !== 200) {
      return bookResponse;
    } else if (!bookResponse.object) {
      // Create a new book
      const response = await this.bookDao.createBook(
        title,
        isbn_list,
        author,
        primary_genre_id,
        audience_id,
        pages,
        series_id,
        series_number,
        publish_date,
        short_description,
        language,
        img_callback
      );
      if (response.statusCode !== 200) {
        return response;
      } else {
        return new SuccessResponse("Completed Book Creation");
      }
    } else {
      // Do stuff to update the book
      const book = bookResponse.object; // guaranteed to exist here
      const updatedInformation: Book = {
        book_title: title,
        author,
        isbn_list,
        primary_genre_id,
        audience_id,
        pages,
        series_id,
        series_number,
        publish_date,
        short_description,
        language,
        img_callback,
      };
      console.log(updatedInformation, book.id);
      return await this.bookDao.update(book.id, updatedInformation);
    }
  }
}

export interface BookInsertRequest {
  book_title: string;
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
}

export interface SecondaryGenreInsertRequest {
  book_id: number;
  genre_id: number;
}

export interface TagInsertRequest {
  book_id: number;
  tag_id: number;
}
