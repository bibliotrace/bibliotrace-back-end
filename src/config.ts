import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import DaoFactory from "./db/dao/DaoFactory";
import { DynamoDb } from "./db/dao/DynamoDb";
import DBConnectionManager from "./db/dbConnection/DBConnectionManager";
import { createIsbnQueryCacheTable } from "./db/schema/templates/DynamoDbTableCreate";
import { AuthHandler } from "./handler/AuthHandler";
import { CoverImageRouteHandler } from "./handler/CoverImageRouteHandler";
import FilterTypeRoutesHandler from "./handler/FilterTypeRoutesHandler";
import SearchRouteHandler from "./handler/SearchRouteHandler";
import AuditService from "./service/AuditService";
import BookManagementService from "./service/BookManagementService";
import CheckoutService from "./service/CheckoutService";
import IsbnService from "./service/IsbnService";
import SearchService from "./service/SearchService";
import SuggestionService from "./service/SuggestionService";

export class Config {
  static dependencies: ConfigTypes = {};

  static async setup(): Promise<void> {
    if (
      this.dependencies.searchRouteHandler != null ||
      this.dependencies.coverImageRouteHandler != null ||
      this.dependencies.authHandler != null ||
      this.dependencies.filterTypeRoutesHandler != null ||
      this.dependencies.bookManagementService != null ||
      this.dependencies.suggestionService != null ||
      this.dependencies.auditService != null ||
      this.dependencies.checkoutService != null ||
      this.dependencies.searchService != null
    ) {
      return; // Prevent re-initialization
    }

    // DynamoDB Stuff
    const hasDynamoEndpoint = process.env.DYNAMO_ENDPOINT !== undefined;
    const ddbClientConfig = hasDynamoEndpoint
      ? {
          region: "us-west-2",
          endpoint: process.env.DYNAMO_ENDPOINT,
          credentials: {
            accessKeyId: "test",
            secretAccessKey: "test",
          },
        }
      : {};
    const dynamoClient = new DynamoDBClient(ddbClientConfig);
    const documentClient = DynamoDBDocumentClient.from(dynamoClient);
    if (process.env.NODE_ENV === "local") {
      await createIsbnQueryCacheTable(documentClient);
    }
    const dynamoDb = new DynamoDb(documentClient);

    // Service Class Dependencies
    const isbnService = new IsbnService();

    // Database Access Class Dependencies
    const dbConnectionManager = new DBConnectionManager();
    dbConnectionManager.testConnection();

    if (process.env.NODE_ENV === "local") {
      await dbConnectionManager.runCreateSQL();
      await dbConnectionManager.runAddDummyData();
    }

    const daoFactory = new DaoFactory(dbConnectionManager.kyselyDB);

    // Route Handlers
    this.dependencies.searchRouteHandler = new SearchRouteHandler(isbnService, dynamoDb);
    this.dependencies.coverImageRouteHandler = new CoverImageRouteHandler();
    this.dependencies.authHandler = new AuthHandler(daoFactory);
    this.dependencies.filterTypeRoutesHandler = new FilterTypeRoutesHandler(daoFactory);
    this.dependencies.bookManagementService = new BookManagementService(daoFactory);

    // Services
    this.dependencies.suggestionService = new SuggestionService(daoFactory);
    this.dependencies.auditService = new AuditService(daoFactory);
    this.dependencies.bookManagementService = new BookManagementService(daoFactory);
    this.dependencies.checkoutService = new CheckoutService(daoFactory);
    this.dependencies.searchService = new SearchService(daoFactory);

    console.log("Dependencies Instantiated");
  }
}

export interface ConfigTypes {
  searchRouteHandler?: SearchRouteHandler;
  coverImageRouteHandler?: CoverImageRouteHandler;
  authHandler?: AuthHandler;
  filterTypeRoutesHandler?: FilterTypeRoutesHandler;
  bookManagementService?: BookManagementService;
  suggestionService?: SuggestionService;
  auditService?: AuditService;
  checkoutService?: CheckoutService;
  searchService?: SearchService;
}

export default new Config();
