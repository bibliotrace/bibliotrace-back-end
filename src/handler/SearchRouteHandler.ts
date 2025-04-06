import IsbnService from "../service/IsbnService";
import SearchDataService from "../service/SearchDataService";

export default class SearchRouteHandler {
  isbn: IsbnService;
  searchService: SearchDataService;

  constructor(isbn: IsbnService, searchService: SearchDataService) {
    this.isbn = isbn;
    this.searchService = searchService;
  }

  async conductSearch(inputQuery: string, campus: string): Promise<ResultRow[]> {
    // Extract from the inputQuery string the filters and the actual search query
    const extractedObject: Filters = this.extractFilters(inputQuery);
    const extractedFilters = extractedObject.queryList;
    const extractedQuery = extractedObject.inputQuery;

    // Get search results from the given query, using magic hehe
    // We run the text string search if and only if the query exists
    let bookIdsResult;
    if (extractedQuery != null && extractedQuery !== "") {
      bookIdsResult = await this.searchService.runSearchForBookIds(extractedQuery);
    }

    // Turn the query list into actionable db query data
    const filterQueryList = await this.convertFilterStringToList(extractedFilters);

    // If bookIdsResult is null, pull all books from the db matching our filters
    let bookDataResult = [];

    if (bookIdsResult == null) {
      bookDataResult = (await this.searchService.retrieveAllBooks(filterQueryList, campus)).object;
    } else {
      const bookSet = new Set<string>();
      // Retrieve book set from metadata function for each matching isbn result. Discard the rest
      for (let i = 0; i < bookIdsResult.length; i++) {
        const metadataResult = await this.searchService.retrieveBasicMetadata(
          filterQueryList,
          bookIdsResult[i],
          campus
        );
        if (metadataResult.statusCode === 200 && metadataResult.object != null) {
          const metadata = metadataResult.object;
          if (!bookSet.has(metadata.id)) {
            // If metadata comes back non-null, add it to the result list and the bookSet
            bookDataResult.push(metadata);
            bookSet.add(metadata.id);
          }
        }
      }
    }

    

    return bookDataResult;
  }

  // ---------- Helper functions for string query parsing ----------

  // Extraction schema is ||Key:Value||||Key:Value||{...}||Key:Value||Search%20Query
  private extractFilters(inputQuery: string): Filters {
    let queryIndexes = this.findIndexes(inputQuery);
    const queryList = [];

    while (queryIndexes != null) {
      const queryKey = inputQuery.slice(queryIndexes.firstDelimiterIndex + 1, queryIndexes.separatorIndex);
      const queryValue = inputQuery.slice(queryIndexes.separatorIndex + 1, queryIndexes.secondDelimiterIndex);
      queryList.push({ queryKey, queryValue });

      inputQuery = inputQuery.slice(queryIndexes.secondDelimiterIndex + 2, inputQuery.length);
      queryIndexes = this.findIndexes(inputQuery);
    }

    return { queryList, inputQuery };
  }

  private findIndexes(inputString: string) {
    let firstDelimiterIndex = -1;
    let secondDelimiterIndex = -1;
    let separatorIndex = -1;

    if (inputString.length < 5) {
      return undefined;
    }

    for (let i = 0; i < inputString.length; i++) {
      if (i < inputString.length - 1) {
        if (inputString[i] === "|" && inputString[i + 1] === "|") {
          if (firstDelimiterIndex === -1) {
            firstDelimiterIndex = i + 1; // give the index of the left |
          } else if (secondDelimiterIndex === -1) {
            secondDelimiterIndex = i; // give the index of the right |
          }

          i += 1;
        } else if (inputString[i] === ":") {
          if (separatorIndex === -1) {
            separatorIndex = i;
          }
        }
      }
    }

    if (firstDelimiterIndex !== -1 && secondDelimiterIndex !== -1 && separatorIndex !== -1) {
      return {
        firstDelimiterIndex,
        separatorIndex: separatorIndex,
        secondDelimiterIndex,
      };
    }
  }

  // This function converts a filter string into a list of objects with the shape [{key, value}]
  private async convertFilterStringToList(filters): Promise<FilterListItem[]> {
    const output: FilterListItem[] = [];

    if (filters != null) {
      for (let i = 0; i < filters.length; i++) {
        const targetKey = filters[i].queryKey;
        const targetVal = filters[i].queryValue;
        // TODO: it seems a little hacky to just set the table name reference directly here
        // maybe we should have a map of filter table names to their respective keys?
        if (targetKey == "Genre") {
          const genreStrings = targetVal.split(",");
          // console.log("Genre Strings: ", genreStrings);

          output.push({ key: "genre.genre_name", value: genreStrings });
        }
        if (targetKey == "Audience") {
          const audienceStrings = targetVal.split(",");
          // console.log("Audience Strings: ", audienceStrings);

          output.push({ key: "audiences.audience_name", value: audienceStrings });
        }
        if (targetKey == "Special") {
          output.push({ key: targetKey, value: targetVal });
        }
      }
    }
    return output;
  }
}

export interface FilterListItem {
  key: string;
  value: string | string[];
}

export interface ResultRow {
  id: string | undefined;
  title: string | undefined;
  author: string | undefined;
  genre: string | undefined;
  series: string | undefined;
  isbn: string | undefined;
  coverImageId: string | undefined;
}

export interface Filters {
  queryList: { queryKey: string; queryValue: string }[];
  inputQuery: string;
}
