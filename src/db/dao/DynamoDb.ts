import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";

export class DynamoDb {
  private readonly dynamoClient: DynamoDBDocumentClient;
  isbnTableName: string;

  constructor(dynamoClient: DynamoDBDocumentClient) {
    this.dynamoClient = dynamoClient;
    this.isbnTableName = process.env.DYNAMO_ISBN_TABLE;
  }

  async checkISBNQueryCache(query: string) {
    const params = {
      TableName: this.isbnTableName,
      Key: {
        query: { S: query.toLowerCase() },
      },
    };

    try {
      const cacheResult = await this.dynamoClient.send(new GetItemCommand(params));
      if (cacheResult.Item != null) {
        return new SuccessResponse(
          `Query ${query} successfully retrieved ISBN data`,
          cacheResult.Item.result.S.split(",")
        );
      } else {
        return new SuccessResponse(
          `Query ${query} failed to find ISBN data`,
          null
        );
      }
    } catch (error) {
      return new ServerErrorResponse(
        `Error checking ISBN cache for query ${query}: ${error.message}`
      );
    }
  }

  async updateISBNQueryCache(query: string, result: string) {
    const params = {
      TableName: this.isbnTableName,
      Item: {
        query: { S: query.toLowerCase() },
        result: { S: result },
      },
    };

    try {
      await this.dynamoClient.send(new PutItemCommand(params));
      return new SuccessResponse(`Successfully updated ISBN cache for query ${query}`);
    } catch (error) {
      return new ServerErrorResponse(
        `Error updating ISBN cache for query ${query}: ${error.message}`
      );
    }
  }
}
