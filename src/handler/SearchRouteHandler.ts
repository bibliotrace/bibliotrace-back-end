import IsbnService from "../service/IsbnService";
import { DynamoDb } from "../db/dao/DynamoDb";
import SearchDataService from "../service/SearchDataService";

export default class SearchRouteHandler {
  isbn: IsbnService;
  dynamoDb: DynamoDb;
  searchService: SearchDataService;

  constructor(isbn: IsbnService, dynamoDb: DynamoDb, searchService) {
    this.isbn = isbn;
    this.dynamoDb = dynamoDb;
    this.searchService = searchService;
  }

  async conductSearch(inputQuery: string, campus: string): Promise<ResultRow[]> {
    // Extract from the inputQuery string the filters and the actual search query
    const extractedObject: Filters = this.extractFilters(inputQuery);
    const extractedFilters = extractedObject.queryList;
    const extractedQuery = extractedObject.inputQuery;

    // Get search results from the given query, either from ISBNdb or our query cache
    let isbnResult: undefined | any[];
    if (extractedQuery != null && extractedQuery !== "") {
      // First, get the target list of isbn numbers from the querystring.
      isbnResult = await this.dynamoDb.checkISBNQueryCache(extractedQuery);
      if (isbnResult == null) {
        console.log(`Submitting Query to ISBN: ${extractedQuery}`);
        isbnResult = await this.isbn.conductSearch(extractedQuery);
        await this.dynamoDb.updateISBNQueryCache(extractedQuery, isbnResult.toString());
      }
    }

    // Turn the query list into actionable db query data
    const filterQueryList = await this.addFiltersToQuery(extractedFilters)

    console.log(`ISBN result list: `, isbnResult);

    // If isbnResult is null, pull all books from the db matching our filters
    const result = [];
    const bookSet = new Set<string>();
    if (isbnResult == null) {
      isbnResult = await this.searchService.retrieveAllISBNs(filterQueryList, campus);
    }

    // Retrieve book set from metadata function for each matching isbn result. Discard the rest
    for (let i = 0; i < isbnResult.length; i++) {
      // Perhaps do this asynchronously to speed things up?
      const metadata = await this.searchService.retrieveMetadata(filterQueryList, isbnResult[i], campus);
      if (metadata != null && !bookSet.has(metadata.id)) {
        // If metadata comes back non-null, add it to the result list and the bookSet
        result.push(metadata);
        bookSet.add(metadata.id);
      }
    }

    return result;
  }

  // ---------- Helper functions for string query parsing ----------

  // Extraction schema is ||Key:Value||||Key:Value||{...}||Key:Value||Search%20Query
  private extractFilters(inputQuery: string): Filters {
    let queryIndexes = this.findIndexes(inputQuery);
    const queryList = [];

    while (queryIndexes != null) {
      let queryKey = inputQuery.slice(
        queryIndexes.firstDelimiterIndex + 1,
        queryIndexes.separatorIndex
      );
      let queryValue = inputQuery.slice(
        queryIndexes.separatorIndex + 1,
        queryIndexes.secondDelimiterIndex
      );
      queryList.push({ queryKey, queryValue });

      inputQuery = inputQuery.slice(
        queryIndexes.secondDelimiterIndex + 2,
        inputQuery.length
      );
      queryIndexes = this.findIndexes(inputQuery);
    }

    return { queryList, inputQuery };
  }

  private findIndexes(inputString: string): any {
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

    if (
      firstDelimiterIndex !== -1 &&
      secondDelimiterIndex !== -1 &&
      separatorIndex !== -1
    ) {
      return {
        firstDelimiterIndex,
        separatorIndex: separatorIndex,
        secondDelimiterIndex,
      };
    }
  }

  private async addFiltersToQuery(filters: any[]): Promise<any[]> {
    let output = []

    if (filters != null) {


      for (let i = 0; i < filters.length; i++) {
        const targetKey = filters[i].queryKey
        const targetVal = filters[i].queryValue

        if (targetKey == 'Genre') {
          const genreStrings = targetVal.split(",")
          console.log('Genre Strings: ', genreStrings)

          output.push({ key: 'genre_types.genre_name', value: genreStrings })
        }
        if (targetKey == 'Audience') {
          const audienceStrings = targetVal.split(',')
          console.log('Audience Strings: ', audienceStrings)

          output.push({ key: 'audiences.audience_name', value: audienceStrings })
        }
      }
    }
    return output
  }
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
