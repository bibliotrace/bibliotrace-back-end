import SearchDataService from "./service/SearchDataService";
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
import SuggestionService from "./service/SuggestionService";
import { AuthService } from "./service/AuthService";
import { InventoryHandler } from "./handler/InventoryHandler";
import { SuggestionHandler } from "./handler/SuggestionHandler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CheckoutHandler } from "./handler/CheckoutHandler";
import LocationService from "./service/LocationService";
import LocationHandler from "./handler/LocationHandler";
import ReportHandler from "./handler/ReportHandler";
import ReportService from "./service/ReportService";
import GenreTagService from "./service/GenreTagService";
import GenreTagHandler from "./handler/GenreTagHandler";

export class Config {
  static dependencies: ConfigTypes = {};
  static suggestionService: SuggestionService;
  static auditService: AuditService;
  static bookManagementService: BookManagementService;
  static checkoutService: CheckoutService;
  static searchDataService: SearchDataService;
  static authService: AuthService;
  static isbnService: IsbnService;
  static locationService: LocationService;
  static reportService: ReportService;
  static genreTagService: GenreTagService;

  static async setup(): Promise<void> {
    if (
      this.dependencies.searchRouteHandler != null ||
      this.dependencies.coverImageRouteHandler != null ||
      this.dependencies.authHandler != null ||
      this.dependencies.filterTypeRoutesHandler != null ||
      this.dependencies.checkoutHandler != null ||
      this.dependencies.locationHandler != null ||
      this.dependencies.reportHandler != null ||
      this.dependencies.genreTagHandler != null ||
      this.bookManagementService != null ||
      this.suggestionService != null ||
      this.auditService != null ||
      this.checkoutService != null ||
      this.searchDataService != null ||
      this.locationService != null ||
      this.reportService != null ||
      this.genreTagService != null
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

    // Database Access Class Dependencies
    const dbConnectionManager = new DBConnectionManager();
    dbConnectionManager.testConnection();

    if (process.env.NODE_ENV === "local") {
      await dbConnectionManager.executeQuery("USE bibliotrace_v3");
      await dbConnectionManager.runCreateSQL();
      await dbConnectionManager.runAddDummyData();
    }

    const daoFactory = new DaoFactory(dbConnectionManager.kyselyDB);

    // Services
    this.isbnService = new IsbnService();
    this.suggestionService = new SuggestionService(daoFactory);
    this.auditService = new AuditService(daoFactory);
    this.bookManagementService = new BookManagementService(daoFactory);
    this.checkoutService = new CheckoutService(daoFactory);
    this.searchDataService = new SearchDataService(daoFactory);
    this.authService = new AuthService(daoFactory);
    this.locationService = new LocationService(daoFactory);
    this.reportService = new ReportService(daoFactory);
    this.genreTagService = new GenreTagService(daoFactory);

    // Route Handlers
    this.dependencies.authHandler = new AuthHandler(this.authService);
    this.dependencies.inventoryHandler = new InventoryHandler(this.bookManagementService, this.isbnService);
    this.dependencies.suggestionHandler = new SuggestionHandler(this.suggestionService);
    this.dependencies.searchRouteHandler = new SearchRouteHandler(
      this.isbnService,
      dynamoDb,
      this.searchDataService
    );
    this.dependencies.coverImageRouteHandler = new CoverImageRouteHandler();
    this.dependencies.filterTypeRoutesHandler = new FilterTypeRoutesHandler(daoFactory);
    this.dependencies.checkoutHandler = new CheckoutHandler(this.checkoutService);
    this.dependencies.locationHandler = new LocationHandler(this.locationService, this.bookManagementService);
    this.dependencies.reportHandler = new ReportHandler(this.reportService);
    this.dependencies.genreTagHandler = new GenreTagHandler(this.genreTagService);

    console.log("Dependencies Instantiated");
  }
}

export interface ConfigTypes {
  searchRouteHandler?: SearchRouteHandler;
  coverImageRouteHandler?: CoverImageRouteHandler;
  authHandler?: AuthHandler;
  filterTypeRoutesHandler?: FilterTypeRoutesHandler;
  inventoryHandler?: InventoryHandler;
  suggestionHandler?: SuggestionHandler;
  checkoutHandler?: CheckoutHandler;
  locationHandler?: LocationHandler;
  reportHandler?: ReportHandler;
  genreTagHandler?: GenreTagHandler;
}

export default new Config();
