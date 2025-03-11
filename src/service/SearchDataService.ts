import { ResultRow } from "../handler/SearchRouteHandler";
import DaoFactory from "../db/dao/DaoFactory";

export default class SearchDataService {
  private readonly daoFactory: DaoFactory;

  constructor(daoFactory: DaoFactory) {
    this.daoFactory = daoFactory;
  }

  // This function is designed to take in a list of filters, an isbn number, and a campus.
  // It will then return basic metadata from various tables assuming the filters and campus 
  // lockdowns let it through.
  async retrieveBasicMetadata(
    filterQueryList, // Expected to be in the format { key: 'genre', value: 'Dystopian' }
    isbn: string, // Expected to be in the format "ISBN||CoverURL"
    campus: string
  ): Promise<ResultRow> {
    const splitIsbn = isbn.split("||");

    try {
      const sqlResult = await this.daoFactory.bookDao.getBasicBookByFilter(filterQueryList, splitIsbn[0], campus)
      const dbResult = sqlResult.object

      if (dbResult != null) {
        const output = {
          id: String(dbResult.id),
          title: dbResult.book_title,
          author: dbResult.author ?? "Unknown",
          genre: dbResult.genre_name,
          series: dbResult.series_name ?? "None",
          isbn: splitIsbn[0],
          coverImageId: null,
        };
        if (splitIsbn.length > 1) {
          const coverUrl = splitIsbn[1];
          const chunksOfUrl = coverUrl.split("/");
          output.coverImageId = chunksOfUrl[chunksOfUrl.length - 1];
        }
        return output;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error trying to retrieve metadata for book: ${error.message}`);
    }
  }

  async retrieveAllISBNs(filterQueryList, campus: string): Promise<string[]> {
    try {
      const dbResult = (await this.daoFactory.bookDao.getAllISBNs(filterQueryList, campus)).object

      if (dbResult != null) {
        return dbResult.flatMap((input) => {
          const result = input.isbn_list;
          return result.split("|")[0];
        });
      } else {
        throw new Error("dbResult was null for some reason!");
      }
    } catch (error) {
      throw new Error(`Error trying to retreive all ISBN's: ${error.message}`);
    }
  }
}