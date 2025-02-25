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
import Response from "./db/response/Response";

export class Config {
  static dependencies: ConfigTypes = {};
  static suggestionService: SuggestionService;
  static auditService: AuditService;
  static bookManagementService: BookManagementService;
  static checkoutService: CheckoutService;
  static searchDataService: SearchDataService;
  static authService: AuthService;
  static isbnService: IsbnService;

  static async setup(): Promise<void> {
    if (
      this.dependencies.searchRouteHandler != null ||
      this.dependencies.coverImageRouteHandler != null ||
      this.dependencies.authHandler != null ||
      this.dependencies.filterTypeRoutesHandler != null ||
      this.bookManagementService != null ||
      this.suggestionService != null ||
      this.auditService != null ||
      this.checkoutService != null ||
      this.searchDataService != null
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
    this.searchDataService = new SearchDataService(
      dbConnectionManager.kyselyDB,
      daoFactory
    );
    this.authService = new AuthService(daoFactory);

    // Route Handlers
    this.dependencies.authHandler = new AuthHandler(this.authService);
    this.dependencies.inventoryHandler = new InventoryHandler(this.bookManagementService);
    this.dependencies.suggestionHandler = new SuggestionHandler(this.suggestionService);
    this.dependencies.searchRouteHandler = new SearchRouteHandler(
      this.isbnService,
      dynamoDb,
      this.searchDataService
    );
    this.dependencies.coverImageRouteHandler = new CoverImageRouteHandler();
    this.dependencies.filterTypeRoutesHandler = new FilterTypeRoutesHandler(daoFactory);

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
  checkoutService?: CheckoutService;
}

export default new Config();

// this logic is duplicated across multiple routes
export function validateUserType(req, res, type: string): boolean {
  if (req.auth.userRole.roleType !== type) {
    res
      .status(401)
      .send({ message: `Improper Caller RoleType, required type is ${type}` });
    return false;
  }
  return true;
}

export function sendResponse(res, response: Response<any>): void {
  const responseBody = { message: response.message, object: null };
  if (response.object) {
    responseBody.object = response.object;
  }
  res.status(response.statusCode).send(responseBody);
}
