import dotenv from "dotenv";
import IsbnService from "./service/IsbnService";
import SearchRouteHandler from "./handler/SearchRouteHandler";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createIsbnQueryCacheTable } from "./db/dynamo/DynamoDbTableCreate";
import { DynamoDb } from "./db/dao/DynamoDb";
import { CoverImageRouteHandler } from "./handler/CoverImageRouteHandler";
import { UserAuthService } from "./service/UserAuthService";
import DBConnectionManager from "./db/mysql/DBConnectionManager";

class Config {
  dependencies: ConfigTypes;

  constructor() {
    this.dependencies = {};
  }

  async setup(): Promise<ConfigTypes> {
    dotenv.config();

    DBConnectionManager.connect();

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

    const isbnService = new IsbnService();

    this.dependencies.searchRouteHandler = new SearchRouteHandler(isbnService, dynamoDb);

    this.dependencies.coverImageRouteHandler = new CoverImageRouteHandler();

    this.dependencies.userAuthService = new UserAuthService();

    console.log("Dependencies Instantiated");
    return {
      searchRouteHandler: this.dependencies.searchRouteHandler,
      coverImageRouteHandler: this.dependencies.coverImageRouteHandler,
      userAuthService: this.dependencies.userAuthService,
    };
  }
}

export interface ConfigTypes {
  searchRouteHandler?: SearchRouteHandler;
  coverImageRouteHandler?: CoverImageRouteHandler;
  userAuthService?: UserAuthService;
}

export default new Config();
