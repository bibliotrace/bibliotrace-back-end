import { Charset, Worker } from "flexsearch";
import DaoFactory from "../db/dao/DaoFactory";
import { FilterListItem, ResultRow } from "../handler/SearchRouteHandler";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import Service from "./Service";

export default class SearchDataService extends Service {
  private titleSearchIndex: Worker;
  private authorSearchIndex: Worker;
  private tagSearchIndex: Worker;
  private seriesSearchIndex: Worker;

  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
    // Type inference on these attributes aren't exported from flexsearch
    const searchOptions = {
      tokenize: "forward",
      encoder: Charset.LatinExtra,
    };

    // @ts-expect-error Types aren't set up properly for the options I selected
    this.titleSearchIndex = new Worker(searchOptions);
    // @ts-expect-error Types aren't set up properly for the options I selected
    this.authorSearchIndex = new Worker(searchOptions);
    // @ts-expect-error Types aren't set up properly for the options I selected
    this.tagSearchIndex = new Worker(searchOptions);
    // @ts-expect-error Types aren't set up properly for the options I selected
    this.seriesSearchIndex = new Worker(searchOptions);
    this.reSeedSearchIndexes().then(() => {
      // Set an interval so that the reSeed function is run every so often to update the search indexes
      setInterval(this.reSeedSearchIndexes.bind(this), 2 * 60000); // 60000 = ms in a minute
    });
  }

  // The reseed function below takes a snapshot from the database of all books' titles and authors and stores
  // that data in the flexsearch in-memory cache after running permutation functions on each word. Once the seed
  // is complete, flexsearch is then ready to return book Id's given a query string, returning if and only if the
  // seeded data matches a fuzzy select with the query.
  public async reSeedSearchIndexes(): Promise<void> {
    try {
      console.log("Beginning Search Re-Index");
      const initTime = performance.now();

      // Pull all book data needed from the db...
      const bookDaoResponse = await this.bookDao.getAllBookTitlesAndAuthors();
      if (bookDaoResponse.statusCode !== 200) {
        console.error(
          `Something happened with the book dao when pulling all book data to seed search: ${bookDaoResponse.message}`
        );
        return;
      } else if (bookDaoResponse.object == null) {
        console.warn("NOTICE: No books found in the books table. Cancelling Search Index update");
        return;
      }
      const allBooks = bookDaoResponse.object;

      const bookTagDaoResponse = await this.bookTagDao.getAllTagNamesByBookId();
      if (bookTagDaoResponse.statusCode !== 200) {
        console.error(
          `Something happened with the book dao when pulling all book data to seed search: ${bookDaoResponse.message}`
        );
        return;
      } else if (bookTagDaoResponse.object == null) {
        console.warn("No tags found to add to the search.");
      }
      const bookTags = bookTagDaoResponse.object;

      const seriesDaoResponse = await this.seriesDao.getSeriesNamePerBookId();
      if (seriesDaoResponse.statusCode !== 200) {
        console.error(
          `Something happened to the Series Dao when pulling all book data to seed search: ${seriesDaoResponse.message}`
        );
        return;
      } else if (seriesDaoResponse.object == null) {
        console.warn("No Series Data found to add to the search.");
      }
      const seriesData = seriesDaoResponse.object;

      // Clear the indexes for rebuilding
      await this.titleSearchIndex.clear();
      await this.authorSearchIndex.clear();
      await this.tagSearchIndex.clear();
      await this.seriesSearchIndex.clear();

      // Add all index addition function calls to a batch list for async processing
      const addCallBatch = [];
      for (const book of allBooks) {
        if (book.id != null && book.book_title != null && book.book_title != "")
          addCallBatch.push(this.titleSearchIndex.add(book.id, book.book_title));
        if (book.id != null && book.author != null && book.author != "")
          addCallBatch.push(this.authorSearchIndex.add(book.id, book.author));
      }

      for (const bookId of Object.keys(bookTags)) {
        const tagsList = bookTags[bookId];
        for (const tag of tagsList) {
          if (tag != null && tag != "") {
            addCallBatch.push(this.tagSearchIndex.add(bookId, tag));
          }
        }
      }

      for (const series of seriesData) {
        if (typeof series == "object" && series.id && series.seriesName) {
          addCallBatch.push(this.seriesSearchIndex.add(series.id, series.seriesName));
        }
      }

      // Run all add book calls asynchronously
      await Promise.all(addCallBatch);

      const endTime = performance.now();
      console.log(`Indexed Search in ${endTime - initTime} ms`);
    } catch (error) {
      console.error(error);
    }
  }

  // This function is designed to take in a query string, then return a list of bookIds that
  // match the search query on book titles, authors, or both, using flexsearch's in-memory cache.
  async runSearchForBookIds(searchQuery: string): Promise<number[]> {
    console.log("Beginning Search, Search Query", searchQuery);
    const initTime = performance.now();

    // Run searches
    const [titleResults, authorResults, tagResults, seriesResults] = await Promise.all([
      this.titleSearchIndex.search(searchQuery) as Promise<number[]>,
      this.authorSearchIndex.search(searchQuery) as Promise<number[]>,
      this.tagSearchIndex.search(searchQuery) as Promise<number[]>,
      this.seriesSearchIndex.search(searchQuery) as Promise<number[]>,
    ]);

    // Combine and deduplicate results
    const resultSet = new Set([...titleResults, ...authorResults, ...tagResults, ...seriesResults]);

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
          isbn: dbResult.isbn_list?.split("|")[0] ?? "Unknown",
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

  // This function queries the database for all books from the database that satisfy the following conditions:
  // 1. The books pulled exist in the inventory table, or are otherwise not checked out.
  // 2. The books pulled match to the filters in the filterQueryList for things like primary genres and popularity
  // 3. The books pulled have inventory rows in the caller's campus
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
}
