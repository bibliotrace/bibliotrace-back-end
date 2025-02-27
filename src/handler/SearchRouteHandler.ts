import IsbnService from "../service/IsbnService";
import { DynamoDb } from "../db/dao/DynamoDb";
import SearchDataService from "../service/SearchDataService";
import Response from "../db/response/Response";
import { Book } from "../db/schema/Book";
import RequestErrorResponse from "../db/response/RequestErrorResponse";

export default class SearchRouteHandler {
  isbn: IsbnService;
  dynamoDb: DynamoDb;
  searchService: SearchDataService;

  constructor(isbn: IsbnService, dynamoDb: DynamoDb, searchService: SearchDataService) {
    this.isbn = isbn;
    this.dynamoDb = dynamoDb;
    this.searchService = searchService;
  }

  public async retrieveMetadataForIsbn(params): Promise<Response<Book | unknown>> {
    if (!params.isbn) {
      return new RequestErrorResponse("ISBN is required to get a book", 400);
    } else if (!this.isValidISBN(params.isbn)) {
      return new RequestErrorResponse(`Invalid ISBN ${params.isbn} provided`, 400);
    }

    return await this.isbn.retrieveMetadata(this.sanitizeISBN(params.isbn));
  }

  async conductSearch(inputQuery: string, campus: string): Promise<ResultRow[]> {
    // Extract from the inputQuery string the filters and the actual search query
    const extractedObject: Filters = this.extractFilters(inputQuery);
    const extractedFilters = extractedObject.queryList;
    const extractedQuery = extractedObject.inputQuery;

    // Get search results from the given query, either from ISBNdb or our query cache
    let isbnResult;
    if (extractedQuery != null && extractedQuery !== "") {
      // First, get the target list of isbn numbers from the querystring.
      const queryCacheResult = await this.dynamoDb.checkISBNQueryCache(extractedQuery);
      if (queryCacheResult != null && queryCacheResult.statusCode === 200) {
        isbnResult = queryCacheResult.object
      }
      if (isbnResult == null) {
        console.log(`Submitting Query to ISBN: ${extractedQuery}`);
        const isbnDbCallResponse = await this.isbn.conductSearch(extractedQuery);
        if (isbnDbCallResponse.object != null) {
          isbnResult = isbnDbCallResponse.object;

          console.log(isbnResult)

          await this.dynamoDb.updateISBNQueryCache(extractedQuery, isbnResult.toString());
        } else {
          console.log("Nothing came back from search to ISBN");
          if (isbnDbCallResponse.statusCode !== null) {
            console.error(
              `Status code received was a ${isbnDbCallResponse.statusCode}. Message is ${isbnDbCallResponse.message}`
            );
          }
        }
      }
    }

    // Turn the query list into actionable db query data
    const filterQueryList = await this.addFiltersToQuery(extractedFilters);

    // If isbnResult is null, pull all books from the db matching our filters
    const result = [];
    const bookSet = new Set<string>();
    if (isbnResult == null) {
      isbnResult = await this.searchService.retrieveAllISBNs(filterQueryList, campus);
    }

    // Retrieve book set from metadata function for each matching isbn result. Discard the rest
    for (let i = 0; i < isbnResult.length; i++) {
      const metadata = await this.searchService.retrieveMetadata(
        filterQueryList,
        isbnResult[i],
        campus
      );
      if (metadata != null && !bookSet.has(metadata.id)) {
        // If metadata comes back non-null, add it to the result list and the bookSet
        result.push(metadata);
        bookSet.add(metadata.id);
      }
    }

    return result;
  }

  private isValidISBN(isbn: string): boolean {
    const isbnClean = isbn.replace(/[-\s]/g, ""); // Remove hyphens and spaces

    // Check if ISBN is ISBN-10
    if (isbnClean.length === 10) {
      const checkSum = isbnClean.split("").reduce((sum, char, index) => {
        // ISBN10 numbers sometimes contain an X, which stands for 10
        const digit = char === "X" ? 10 : parseInt(char, 10);
        return sum + digit * (10 - index);
      }, 0);
      return checkSum % 11 === 0;
    }

    // Check if ISBN is ISBN-13
    if (isbnClean.length === 13) {
      const checkSum = isbnClean.split("").reduce((sum, char, index) => {
        const digit = parseInt(char, 10);
        return sum + (index % 2 === 0 ? digit : digit * 3);
      }, 0);
      return checkSum % 10 === 0;
    }

    return false; // Not a valid ISBN length
  }

  private sanitizeISBN(isbn: string): string {
    return isbn.replace(/[-\s]/g, "");
  }

  // ---------- Helper functions for string query parsing ----------

  // Extraction schema is ||Key:Value||||Key:Value||{...}||Key:Value||Search%20Query
  private extractFilters(inputQuery: string): Filters {
    let queryIndexes = this.findIndexes(inputQuery);
    const queryList = [];

    while (queryIndexes != null) {
      const queryKey = inputQuery.slice(
        queryIndexes.firstDelimiterIndex + 1,
        queryIndexes.separatorIndex
      );
      const queryValue = inputQuery.slice(
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

  private async addFiltersToQuery(filters) {
    const output = [];

    if (filters != null) {
      for (let i = 0; i < filters.length; i++) {
        const targetKey = filters[i].queryKey;
        const targetVal = filters[i].queryValue;

        if (targetKey == "Genre") {
          const genreStrings = targetVal.split(",");
          console.log("Genre Strings: ", genreStrings);

          output.push({ key: "genre_types.genre_name", value: genreStrings });
        }
        if (targetKey == "Audience") {
          const audienceStrings = targetVal.split(",");
          console.log("Audience Strings: ", audienceStrings);

          output.push({ key: "audiences.audience_name", value: audienceStrings });
        }
      }
    }
    return output;
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
