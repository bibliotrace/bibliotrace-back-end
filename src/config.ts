import IsbnService from "./service/IsbnService";
import SearchRouteHandler from "./handler/SearchRouteHandler";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createIsbnQueryCacheTable } from "./db/schema/templates/DynamoDbTableCreate";
import { DynamoDb } from "./db/dao/DynamoDb";
import { CoverImageRouteHandler } from "./handler/CoverImageRouteHandler";
import { AuthHandler } from "./handler/AuthHandler";
import DBConnectionManager from "./db/dbConnection/DBConnectionManager";
import AudienceDao from "./db/dao/AudienceDao";
import AuditDao from "./db/dao/AuditDao";
import AuditStateDao from "./db/dao/AuditStateDao";
import BookDao from "./db/dao/BookDao";
import CampusDao from "./db/dao/CampusDao";
import CheckoutDao from "./db/dao/CheckoutDao";
import GenresDao from "./db/dao/GenresDao";
import GenreTypeDao from "./db/dao/GenreTypeDao";
import InventoryDao from "./db/dao/InventoryDao";
import SeriesDao from "./db/dao/SeriesDao";
import SuggestionDao from "./db/dao/SuggestionDao";
import TagDao from "./db/dao/TagDao";
import UserDao from "./db/dao/UserDao";
import UserRoleDao from "./db/dao/UserRoleDao";
import BookManagementService from "./service/BookManagementService";
import FilterTypeRoutesHandler from "./handler/FilterTypeRoutesHandler";

export class Config {
  static dependencies: ConfigTypes = {}

  static async setup(): Promise<void> {
    if (this.dependencies.searchRouteHandler != null) {
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
    const documentClient = DynamoDBDocumentClient.from(dynamoClient)
    if (process.env.NODE_ENV === 'local') {
      await createIsbnQueryCacheTable(documentClient);
    }
    const dynamoDb = new DynamoDb(documentClient);

    // Service Class Dependencies
    const isbnService = new IsbnService();
    
    // Database Access Class Dependencies
    const dbConnectionManager = new DBConnectionManager()
    dbConnectionManager.testConnection()

    if (process.env.NODE_ENV === 'local') {
      await dbConnectionManager.runCreateSQL()
      await dbConnectionManager.runAddDummyData()
    }
    
    const audienceDao = new AudienceDao(dbConnectionManager.kyselyDB)
    const auditDao = new AuditDao(dbConnectionManager.kyselyDB)
    const auditStateDao = new AuditStateDao(dbConnectionManager.kyselyDB)
    const bookDao = new BookDao(dbConnectionManager.kyselyDB)
    const campusDao = new CampusDao(dbConnectionManager.kyselyDB)
    const checkoutDao = new CheckoutDao(dbConnectionManager.kyselyDB)
    const genresDao = new GenresDao(dbConnectionManager.kyselyDB)
    const genreTypeDao = new GenreTypeDao(dbConnectionManager.kyselyDB)
    const inventoryDao = new InventoryDao(dbConnectionManager.kyselyDB)
    const seriesDao = new SeriesDao(dbConnectionManager.kyselyDB)
    const suggestionDao = new SuggestionDao(dbConnectionManager.kyselyDB)
    const tagDao = new TagDao(dbConnectionManager.kyselyDB)
    const userDao = new UserDao(dbConnectionManager.kyselyDB)
    const userRoleDao = new UserRoleDao(dbConnectionManager.kyselyDB)   

    // Route Handlers
    this.dependencies.searchRouteHandler = new SearchRouteHandler(isbnService, dynamoDb);
    this.dependencies.coverImageRouteHandler = new CoverImageRouteHandler();
    this.dependencies.authHandler = new AuthHandler(campusDao, userDao, userRoleDao);
    this.dependencies.filterTypeRoutesHandler = new FilterTypeRoutesHandler(audienceDao, genreTypeDao)
    this.dependencies.bookManagementService = new BookManagementService(audienceDao, bookDao, campusDao, checkoutDao, genreTypeDao, inventoryDao, seriesDao,)

    console.log("Dependencies Instantiated");
  }
}

export interface ConfigTypes {
  searchRouteHandler?: SearchRouteHandler
  coverImageRouteHandler?: CoverImageRouteHandler
  authHandler?: AuthHandler
  filterTypeRoutesHandler?: FilterTypeRoutesHandler
  bookManagementService?: BookManagementService
}

export default new Config();

