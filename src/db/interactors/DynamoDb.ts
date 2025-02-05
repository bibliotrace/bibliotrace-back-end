import { AttributeValue, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";


export class DynamoDb {
    private readonly dynamoClient: DynamoDBDocumentClient
    isbnTableName: string

    constructor(dynamoClient:DynamoDBDocumentClient) {
        this.dynamoClient = dynamoClient
        this.isbnTableName = process.env.DYNAMO_ISBN_TABLE
    }

    async checkISBNQueryCache (query: string) {
        const params = {
            TableName: this.isbnTableName,
            Key: {
                query: { S: query.toLowerCase() }
            }
        }

        const cacheResult = await this.dynamoClient.send(new GetItemCommand(params))
        if (cacheResult.Item != null) {
          return cacheResult.Item.result.S.split(',')
        } else {
          return null
        }
    }

    async updateISBNQueryCache (query: string, result: string) {
        const params = {
            TableName: this.isbnTableName,
            Item: {
                query: { S: query.toLowerCase() },
                result: { S: result }
            }
        }

        await this.dynamoClient.send(new PutItemCommand(params))
    }
}