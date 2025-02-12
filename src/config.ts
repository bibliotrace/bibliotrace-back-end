import IsbnService from "./services/IsbnService";
import SearchRouteHandler from "./handlers/SearchRouteHandler";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createIsbnQueryCacheTable } from "./db/setup/DynamoDbTableCreate";
import { DynamoDb } from "./db/interactors/DynamoDb";
import { CoverImageRouteHandler } from "./handlers/CoverImageRouteHandler";
import { UserAuthService } from "./services/UserAuthService";
import DBConnectionManager from "./db/dbConnection/DBConnectionManager";
import AudienceDao from "./db/interactors/AudienceDao";
import AuditDao from "./db/interactors/AuditDao";
import AuditStateDao from "./db/interactors/AuditStateDao";
import BookDao from "./db/interactors/BookDao";
import CampusDao from "./db/interactors/CampusDao";
import CheckoutDao from "./db/interactors/CheckoutDao";
import GenresDao from "./db/interactors/GenresDao";
import GenreTypeDao from "./db/interactors/GenreTypeDao";
import InventoryDao from "./db/interactors/InventoryDao";
import SeriesDao from "./db/interactors/SeriesDao";
import SuggestionDao from "./db/interactors/SuggestionDao";
import TagDao from "./db/interactors/TagDao";
import UserDao from "./db/interactors/UserDao";
import UserRoleDao from "./db/interactors/UserRoleDao";

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
    const documentClient = DynamoDBDocumentClient.from(dynamoClient);
    await createIsbnQueryCacheTable(documentClient);
    const dynamoDb = new DynamoDb(documentClient);

    // Service Class Dependencies
    const isbnService = new IsbnService();
    
    // Database Access Class Dependencies
    const host = process.env.DB_HOST ?? "localhost"
    const user = process.env.DB_USER ?? "admin"
    const password = process.env.DB_PASSWORD ?? "Bibl!otrace_2025"
    const database = process.env.DB_TARGET_NAME ?? "bibliotrace_v3"
    const dbConnectionManager = new DBConnectionManager(host, user, password, database)
    dbConnectionManager.testConnection()
    
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
    this.dependencies.userAuthService = new UserAuthService(campusDao, userDao, userRoleDao);

    console.log("Dependencies Instantiated");
  }
}

export interface ConfigTypes {
  searchRouteHandler?: SearchRouteHandler
  coverImageRouteHandler?: CoverImageRouteHandler
  userAuthService?: UserAuthService
}


