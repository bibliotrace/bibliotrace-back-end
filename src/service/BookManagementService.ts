import DaoFactory from "../db/dao/DaoFactory";
import { Book } from "../db/schema/Book";
import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import SuccessResponse from "../response/SuccessResponse";
import SearchDataService from "./SearchDataService";
import Service from "./Service";

// const MAX_TTL = 60 * 24 * 7; // 1 week in minutes

export default class BookManagementService extends Service {
  private readonly searchDataService: SearchDataService;

  constructor(daoFactory: DaoFactory, searchDataServiceRef: SearchDataService) {
    super(daoFactory);
    this.searchDataService = searchDataServiceRef;
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

  // NOTE: This function will not update Secondary genres and tags for a given book. Those are done via separate calls because of the
  //       many-to-one relationship of the secondary genre list and the tags list. We can build in the ability to update those lists in
  //       this function, but I stopped including features with this one function after it got to a hundred lines haha.
  public async createOrUpdateBookData(request: any): Promise<Response<any>> {
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
    if (series_name && series_name != "") {
      let seriesResponse = await this.seriesDao.getByKeyAndValue("series_name", series_name);
      if (seriesResponse != null && seriesResponse.statusCode != 200) {
        return seriesResponse;
      } else if (seriesResponse.object != null) {
        series_id = seriesResponse.object.id;
      } else {
        seriesResponse = await this.seriesDao.create({ series_name });
        if (seriesResponse.statusCode != 200) {
          return seriesResponse;
        } else {
          series_id = seriesResponse.object.id;
        }
      }
    }

    if (primary_genre_id == null || audience_id == null) {
      return new RequestErrorResponse("Primary Genre and Audience Required, but Not Found", 400);
    }

    const bookResponse = await this.getByIsbn(isbn_list.split("||")[0]);

    if (bookResponse.statusCode !== 200 && bookResponse.statusCode !== 404) {
      return bookResponse;
    } else if (bookResponse.statusCode === 404 || !bookResponse.object) {
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
        // Update the search cache with the new book
        await this.searchDataService.reSeedSearchIndexes();
        return new SuccessResponse("Completed Book Creation");
      }
    } else {
      // Update the book data
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
      const result = await this.bookDao.update(book.id, updatedInformation);
      if (result.statusCode === 200) {
        // Update the search cache with new data
        await this.searchDataService.reSeedSearchIndexes();
      }
      return result;
    }
  }

  public async addGenreToBook(genreString: string, isbn: string): Promise<Response<any>> {
    let genreId, bookId;
    const genreResponse = await this.genreDao.getByKeyAndValue("genre_name", genreString);
    if (genreResponse != null && genreResponse.statusCode !== 200) {
      return genreResponse;
    } else if (genreResponse != null && genreResponse.object != null) {
      genreId = genreResponse.object.id;
    } else {
      return new RequestErrorResponse("Genre Not Found", 404);
    }
    const bookResponse = await this.bookDao.getBookByIsbn(isbn);
    if (bookResponse != null && bookResponse.statusCode !== 200) {
      return bookResponse;
    } else if (bookResponse != null) {
      bookId = bookResponse.object.id;
    } else {
      return new RequestErrorResponse("Book Not Found by ISBN", 404);
    }

    const bookGenreResponse = await this.bookGenreDao.getAllByKeyAndValue("book_id", bookId);
    if (bookGenreResponse != null && bookGenreResponse.statusCode !== 200) {
      return bookGenreResponse;
    } else if (bookGenreResponse != null && bookGenreResponse.object != null) {
      // Secondary Genres exist, check through them to see if you can find the new insert
      // If so, return before doing the create again
      const bookGenrePairs = bookGenreResponse.object;
      for (const bookGenrePair of bookGenrePairs) {
        if (bookGenrePair.genre_id === genreId) {
          return new SuccessResponse("No Change", bookGenrePair);
        }
      }
    }

    return await this.bookGenreDao.create({ book_id: bookId, genre_id: genreId });
  }

  public async deleteGenreFromBook(genreString: string, isbn: string): Promise<Response<any>> {
    let genreId, bookId;
    const genreResponse = await this.genreDao.getByKeyAndValue("genre_name", genreString);
    if (genreResponse != null && genreResponse.statusCode !== 200) {
      return genreResponse;
    } else if (genreResponse != null && genreResponse.object != null) {
      genreId = genreResponse.object.id;
    } else {
      return new RequestErrorResponse("Genre Not Found", 404);
    }
    const bookResponse = await this.bookDao.getBookByIsbn(isbn);
    if (bookResponse != null && bookResponse.statusCode !== 200) {
      return bookResponse;
    } else if (bookResponse != null) {
      bookId = bookResponse.object.id;
    } else {
      return new RequestErrorResponse("Book Not Found by ISBN", 404);
    }

    const bookGenreResponse = await this.bookGenreDao.getAllByKeyAndValue("book_id", bookId);
    if (bookGenreResponse != null && bookGenreResponse.statusCode !== 200) {
      return bookGenreResponse;
    } else if (bookGenreResponse != null && bookGenreResponse.object != null) {
      // Secondary Genres exist, check through them to see if you can find the new insert
      // If so, run the delete function
      const bookGenrePairs = bookGenreResponse.object;
      for (const bookGenrePair of bookGenrePairs) {
        if (bookGenrePair.genre_id === genreId) {
          return await this.bookGenreDao.delete(bookGenrePair.id);
        }
      }
    }

    return new SuccessResponse("No Change");
  }

  public async addTagToBook(tagString: string, isbn: string): Promise<Response<any>> {
    let tagId, bookId;
    const tagResponse = await this.tagDao.getByKeyAndValue("tag_name", tagString);
    if (tagResponse != null && tagResponse.statusCode !== 200) {
      return tagResponse;
    } else if (tagResponse != null && tagResponse.object != null) {
      tagId = tagResponse.object.id;
    } else {
      return new RequestErrorResponse("Tag Not Found", 404);
    }
    const bookResponse = await this.bookDao.getBookByIsbn(isbn);
    if (bookResponse != null && bookResponse.statusCode !== 200) {
      return bookResponse;
    } else if (bookResponse != null) {
      bookId = bookResponse.object.id;
    } else {
      return new RequestErrorResponse("Book Not Found by ISBN", 404);
    }

    const bookTagResponse = await this.bookTagDao.getAllByKeyAndValue("book_id", bookId);
    if (bookTagResponse != null && bookTagResponse.statusCode !== 200) {
      return bookTagResponse;
    } else if (bookTagResponse != null && bookTagResponse.object != null) {
      // Secondary Tags exist, check through them to see if you can find the new insert
      // If so, return before doing the create again
      const bookTagPairs = bookTagResponse.object;
      for (const bookTagPair of bookTagPairs) {
        if (bookTagPair.tag_id === tagId) {
          return new SuccessResponse("No Change", bookTagPair);
        }
      }
    }

    return await this.bookTagDao.create({ book_id: bookId, tag_id: tagId });
  }

  public async deleteTagFromBook(tagString: string, isbn: string): Promise<Response<any>> {
    let tagId, bookId;
    const tagResponse = await this.tagDao.getByKeyAndValue("tag_name", tagString);
    if (tagResponse != null && tagResponse.statusCode !== 200) {
      return tagResponse;
    } else if (tagResponse != null && tagResponse.object != null) {
      tagId = tagResponse.object.id;
    } else {
      return new RequestErrorResponse("Tag Not Found", 404);
    }
    const bookResponse = await this.bookDao.getBookByIsbn(isbn);
    if (bookResponse != null && bookResponse.statusCode !== 200) {
      return bookResponse;
    } else if (bookResponse != null) {
      bookId = bookResponse.object.id;
    } else {
      return new RequestErrorResponse("Book Not Found by ISBN", 404);
    }

    const bookTagResponse = await this.bookTagDao.getAllByKeyAndValue("book_id", bookId);
    if (bookTagResponse != null && bookTagResponse.statusCode !== 200) {
      return bookTagResponse;
    } else if (bookTagResponse != null && bookTagResponse.object != null) {
      // Secondary Genres exist, check through them to see if you can find the new insert
      // If so, run the delete function
      const bookTagPairs = bookTagResponse.object;
      for (const bookGenrePair of bookTagPairs) {
        if (bookGenrePair.tag_id === tagId) {
          return await this.bookTagDao.delete(bookGenrePair.id);
        }
      }
    }

    return new SuccessResponse("No Change");
  }

  // IMPORTANT TODO: This function does not check which campus the book associated with the ISBN is in
  // this means that if a book is in multiple campuses, it will delete all of them
  // This will likely need some custom DAO methods to filter responses by campus
  public async removeBookByIsbn(isbn: string): Promise<Response<any>> {
    const bookResponse = await this.bookDao.getBookByIsbn(isbn);
    if (bookResponse && bookResponse.statusCode !== 200) {
      return bookResponse;
    } else if (bookResponse && bookResponse.object != null) {
      const bookId = bookResponse.object.id;

      // delete the tags and genre mappings associated with the book
      const tagsResponse = await this.bookTagDao.getAllByKeyAndValue("book_id", bookId);
      if (tagsResponse && tagsResponse.statusCode === 200 && tagsResponse.object != null) {
        const tags = tagsResponse.object;
        for (const tag of tags) {
          const deleteTagResponse = await this.bookTagDao.delete(tag.id);
          if (deleteTagResponse.statusCode != 200) return deleteTagResponse;
        }
      }

      // delete checkout entries associated with the book
      // note this would remove it from checkout reports, which might not be what is desired
      // however, deleting a book comes with the consequence that you can't get any data back on it
      // so I think that it just should be emphasized on the remove page that there won't be any data
      // after the book has been removed, thus removes should only be executed with extreme caution
      const checkoutsResponse = await this.checkoutDao.getAllByKeyAndValue("book_id", bookId);
      if (checkoutsResponse && checkoutsResponse.statusCode === 200 && checkoutsResponse.object != null) {
        const checkouts = checkoutsResponse.object;
        for (const checkout of checkouts) {
          const deleteCheckoutResponse = await this.checkoutDao.delete(checkout.checkout_id);
          if (deleteCheckoutResponse.statusCode != 200) return deleteCheckoutResponse;
        }
      }

      // delete all inventory entries associated with the book
      const inventoryResponse = await this.inventoryDao.getAllByKeyAndValue("book_id", bookId);
      if (inventoryResponse && inventoryResponse.statusCode === 200 && inventoryResponse.object != null) {
        const inventory = inventoryResponse.object;
        // console.log(inventory);
        for (const inv of inventory) {
          // delete all audit entries associated with the current qr
          // same idea as deleting checkouts, this removes it from reports
          // but it is a necessary evil to remove the book from the system
          const auditResponse = await this.auditEntryDao.getAllByKeyAndValue("qr", inv.qr);
          if (auditResponse && auditResponse.statusCode === 200 && auditResponse.object != null) {
            const audits = auditResponse.object;
            // console.log(`Audit entries associated with qr ${inv.qr}`, audits);
            for (const audit of audits) {
              const auditEntryDeleteResponse = await this.auditEntryDao.delete(audit.qr);
              if (auditEntryDeleteResponse.statusCode != 200) return auditEntryDeleteResponse;
            }
          }

          const inventoryDeleteResponse = await this.inventoryDao.delete(inv.qr);
          if (inventoryDeleteResponse.statusCode != 200) return inventoryDeleteResponse;
        }
      }

      // delete from shopping list
      const shoppingListResponse = await this.shoppingListDao.getAllByKeyAndValue("book_id", bookId);
      if (
        shoppingListResponse &&
        shoppingListResponse.statusCode === 200 &&
        shoppingListResponse.object != null
      ) {
        const shoppingList = shoppingListResponse.object;
        for (const shoppingListEntry of shoppingList) {
          const shoppingListDeleteResponse = await this.shoppingListDao.delete(shoppingListEntry.book_id);
          if (shoppingListDeleteResponse.statusCode != 200) return shoppingListDeleteResponse;
        }
      }

      // delete from restock list
      const restockListResponse = await this.restockListDao.getAllByKeyAndValue("book_id", bookId);
      if (
        restockListResponse &&
        restockListResponse.statusCode === 200 &&
        restockListResponse.object != null
      ) {
        const restockList = restockListResponse.object;
        for (const restockListEntry of restockList) {
          const restockListDeleteResponse = await this.restockListDao.delete(restockListEntry.book_id);
          if (!restockListDeleteResponse.object) return restockListDeleteResponse;
        }
      }

      // delete the book itself
      const result = await this.bookDao.delete(bookId);
      if (result.statusCode === 200) {
        // Update the search cache with new data
        await this.searchDataService.reSeedSearchIndexes();
      }

      return result;
    } else {
      return new RequestErrorResponse(`No book found with isbn ${isbn}`, 404);
    }
  }

  // TODO: because there are a couple duplicate QR codes across campuses
  // this function will need to filter the audit entries by the campus
  public async removeBookByQr(qr: string): Promise<Response<any>> {
    // delete audit entries associated with current qr
    const auditResponse = await this.auditEntryDao.getAllByKeyAndValue("qr", qr);
    if (auditResponse && auditResponse.statusCode === 200 && auditResponse.object != null) {
      const audits = auditResponse.object;
      console.log(`Audit entries associated with qr ${qr}`, audits);
      for (const audit of audits) {
        const auditEntryDeleteResponse = await this.auditEntryDao.delete(audit.qr);
        if (auditEntryDeleteResponse.statusCode != 200) return auditEntryDeleteResponse;
      }
    }

    // delete checkout entries associated with current qr
    const checkoutsResponse = await this.checkoutDao.getAllByKeyAndValue("qr", qr);
    if (checkoutsResponse && checkoutsResponse.statusCode === 200 && checkoutsResponse.object != null) {
      const checkouts = checkoutsResponse.object;
      for (const checkout of checkouts) {
        const deleteCheckoutResponse = await this.checkoutDao.delete(checkout.checkout_id);
        if (deleteCheckoutResponse.statusCode != 200) return deleteCheckoutResponse;
      }
    }

    // delete the inventory entry associated with the qr
    const response = await this.inventoryDao.delete(qr);
    if (response.message.includes("No inventory found with qr")) {
      return new RequestErrorResponse(
        `No inventory found with qr code ${qr}. Please scan a valid QR code.`,
        404
      );
    }

    if (response.statusCode === 200) {
      await this.searchDataService.reSeedSearchIndexes();
    }
    return response;
  }

  public async getQuantities(bookId: number) {
    return await this.inventoryDao.getBookInventoryAvailable(bookId);
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
