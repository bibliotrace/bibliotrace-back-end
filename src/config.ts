import IsbnService from "./services/IsbnService";
import SearchRouteHandler from "./handlers/SearchRouteHandler";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createIsbnQueryCacheTable } from "./db/setup/DynamoDbTableCreate";
import { DynamoDb } from "./db/interactors/DynamoDb";
import { CoverImageRouteHandler } from "./handlers/CoverImageRouteHandler";
import { UserAuthService } from "./services/UserAuthService";
import DBConnectionManager from "./mysql/DBConnectionManager";

export class Config {
  static dependencies: ConfigTypes = {}

  static async setup(): Promise<void> {
    if (this.dependencies.searchRouteHandler != null) {
      return; // Prevent re-initialization
    }

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
    
  }
}

export interface ConfigTypes {
  searchRouteHandler?: SearchRouteHandler;
  coverImageRouteHandler?: CoverImageRouteHandler;
  userAuthService?: UserAuthService;
}


