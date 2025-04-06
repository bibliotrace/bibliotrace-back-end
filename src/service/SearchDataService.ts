import { Worker, Charset } from "flexsearch";
import DaoFactory from "../db/dao/DaoFactory";
import { FilterListItem, ResultRow } from "../handler/SearchRouteHandler";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import Service from "./Service";

export default class SearchDataService extends Service {
  private titleSearchIndex: Worker;
  private authorSearchIndex: Worker;

  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
    this.reSeedSearchIndexes().then(() => {
      // Set an interval so that the reSeed function is run every so often to update the search indexes
      setInterval(this.reSeedSearchIndexes.bind(this), 1 * 60000); // 60000 = ms in a minute
    });
  }

  // This function is designed to take in a query string, then return a list of bookIds that
  // match the search query on book titles, authors, or both.
  async runSearchForBookIds(searchQuery: string): Promise<number[]> {
    console.log("Beginning Search, Search Query", searchQuery);
    const initTime = performance.now();

    // Run searches
    const [titleResults, authorResults] = await Promise.all([
      this.titleSearchIndex.search(searchQuery) as Promise<number[]>,
      this.authorSearchIndex.search(searchQuery) as Promise<number[]>,
    ]);

    // Combine and deduplicate results
    const resultSet = new Set([...titleResults, ...authorResults]);

    const finishedTime = performance.now();
    console.log(`Completed search in ${finishedTime - initTime} ms`);
    return Array.from(resultSet);
  }

  // This function is designed to take in a list of filters, a book Id, and a campus.
  // It will then return basic metadata from various tables assuming the filters and campus
  // lockdowns let it through.
  async retrieveBasicMetadata(
    filterQueryList: FilterListItem[], // Expected to be in the format { key: 'genre', value: 'Dystopian' }
    bookId: number, // Expected to be a number corresponding to the db entry for the book ids
    campus: string
  ): Promise<Response<ResultRow>> {
    try {
      const sqlResult = await this.bookDao.getBasicBookByFilter(filterQueryList, bookId, campus);
      const dbResult = sqlResult.object;

      if (dbResult != null && sqlResult.statusCode === 200) {
        const output = {
          id: String(dbResult.id),
          title: dbResult.book_title,
          author: dbResult.author ?? "Unknown",
          genre: dbResult.genre_name,
          series: dbResult.series_name ?? "None",
          isbn: dbResult.isbn_list.split("|")[0] ?? "Unknown",
          coverImageId: null,
        };
        return new SuccessResponse("Successfully grabbed book info", output);
      } else if (sqlResult.statusCode === 200) {
        return new SuccessResponse("No Book Found");
      } else {
        return sqlResult;
      }
    } catch (error) {
      return new ServerErrorResponse(`Error trying to retrieve metadata for book: ${error.message}`, 500);
    }
  }

  async retrieveAllBooks(filterQueryList, campus: string): Promise<Response<string[]>> {
    try {
      const daoResponse = await this.bookDao.getAllBooksMatchingFilter(filterQueryList, campus);
      if (daoResponse.statusCode !== 200) {
        return daoResponse;
      }

      const dbResult = daoResponse.object.map((bookEntry) => {
        return {
          id: bookEntry.id,
          title: bookEntry.book_title,
          author: bookEntry.author ?? "Unknown",
          genre: bookEntry.genre_name,
          series: bookEntry.series_name ?? "None",
          isbn: bookEntry.isbn_list.split("|")[0] ?? "Unknown",
          coverImageId: null,
        };
      });
      if (dbResult != null && dbResult.length > 0) {
        return new SuccessResponse("Successfully retrieved book data", dbResult);
      } else {
        return new ServerErrorResponse("Request for book data came back null", 404);
      }
    } catch (error) {
      return new ServerErrorResponse(
        `Error trying to retreive all books given filters: ${error.message}`,
        500
      );
    }
  }

  // --------------- Private Helper Methods ---------------

  private async reSeedSearchIndexes(): Promise<void> {
    try {
      console.log("Beginning Search Re-Index");

      // Pull all book data needed from the db...
      let allBooks = [];
      const bookDaoResponse = await this.bookDao.getAllBookTitlesAndAuthors();
      if (bookDaoResponse.statusCode !== 200) {
        console.error(
          `Something happened with the book dao when pulling all book data to seed search: ${bookDaoResponse.message}`
        );
      } else if (bookDaoResponse.object == null) {
        console.log("NOTICE: No books found in the books table. Cancelling Search Index update");
        return;
      } else {
        allBooks = bookDaoResponse.object;
      }

      const initTime = performance.now();
      // Type inference on these attributes aren't exported from fast
      const searchOptions = {
        tokenize: "forward",
        encoder: Charset.LatinExtra,

      };

      // @ts-expect-error
      this.titleSearchIndex = new Worker(searchOptions);
      // @ts-expect-error
      this.authorSearchIndex = new Worker(searchOptions);

      // Add all index addition function calls to a batch list for async processing
      const addCallBatch = [];
      for (const book of allBooks) {
        if (book.id != null && book.book_title != null && book.book_title != "")
          addCallBatch.push(this.titleSearchIndex.add(book.id, book.book_title));
        if (book.id != null && book.author != null && book.author != "")
          addCallBatch.push(this.authorSearchIndex.add(book.id, book.author));
      }

      // Run all add book calls asynchronously
      await Promise.all(addCallBatch);

      const endTime = performance.now();
      console.log(`Indexed Search in ${endTime - initTime} ms`);
    } catch (error) {
      console.error(error);
    }
  }
}
