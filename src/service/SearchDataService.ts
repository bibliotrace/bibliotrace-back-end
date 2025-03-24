import { FilterListItem, ResultRow } from "../handler/SearchRouteHandler";
import Response from "../response/Response";
import DaoFactory from "../db/dao/DaoFactory";
import SuccessResponse from "../response/SuccessResponse";
import ServerErrorResponse from "../response/ServerErrorResponse";

export default class SearchDataService {
  private readonly daoFactory: DaoFactory;

  constructor(daoFactory: DaoFactory) {
    this.daoFactory = daoFactory;
  }

  // This function is designed to take in a list of filters, an isbn number, and a campus.
  // It will then return basic metadata from various tables assuming the filters and campus
  // lockdowns let it through.
  async retrieveBasicMetadata(
    filterQueryList: FilterListItem[], // Expected to be in the format { key: 'genre', value: 'Dystopian' }
    isbn: string, // Expected to be in the format "ISBN||CoverURL"
    campus: string
  ): Promise<Response<ResultRow>> {
    const splitIsbn = isbn.split("||");

    try {
      const sqlResult = await this.daoFactory.bookDao.getBasicBookByFilter(
        filterQueryList,
        splitIsbn[0],
        campus
      );
      const dbResult = sqlResult.object;

      if (dbResult != null && sqlResult.statusCode === 200) {
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
        return new SuccessResponse("Successfully grabbed book info", output);
      } else if (sqlResult.statusCode === 200) {
        return new SuccessResponse("No Book Found");
      } else {
        return sqlResult;
      }
    } catch (error) {
      return new ServerErrorResponse(
        `Error trying to retrieve metadata for book: ${error.message}`,
        500
      );
    }
  }

  async retrieveAllISBNs(filterQueryList, campus: string): Promise<Response<string[]>> {
    try {
      const daoResponse = await this.daoFactory.bookDao.getAllISBNs(filterQueryList, campus);
      if (daoResponse.statusCode !== 200) {
        return daoResponse;
      }

      const dbResult = daoResponse.object;
      if (dbResult != null && dbResult.length > 0) {
        const resultList = dbResult.flatMap((input) => {
          const result = input.isbn_list;
          return result.split("|")[0];
        });
        return new SuccessResponse("Successfully parsed all ISBNs", resultList);
      } else {
        return new ServerErrorResponse("dbResult was null for some reason!", 404);
      }
    } catch (error) {
      return new ServerErrorResponse(`Error trying to retreive all ISBN's: ${error.message}`, 500);
    }
  }
}
