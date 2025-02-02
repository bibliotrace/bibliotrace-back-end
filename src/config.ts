import dotenv from "dotenv"
import MySQL from "./db/interactors/MySQL"
import IsbnService from "./services/IsbnService"
import SearchRouteHandler from "./handlers/SearchRouteHandler"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { createIsbnQueryCacheTable } from "./db/setup/DynamoDbTableCreate"
import { DynamoDb } from "./db/interactors/DynamoDb"
import { CoverImageRouteHandler } from "./handlers/CoverImageRouteHandler"

class Config {
    dependencies: ConfigTypes

    constructor() {
        this.dependencies = {}
    }
        
    async setup(): Promise<ConfigTypes> {
        dotenv.config()
        
        const db = new MySQL();
        await db.connect()

        const hasDynamoEndpoint = process.env.DYNAMO_ENDPOINT !== undefined
        const ddbClientConfig = hasDynamoEndpoint ? 
        {
            region: 'us-west-2',
            endpoint: process.env.DYNAMO_ENDPOINT, 
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test'
            }
        } : {}
        const dynamoClient = new DynamoDBClient(ddbClientConfig)
        const documentClient = DynamoDBDocumentClient.from(dynamoClient)
        await createIsbnQueryCacheTable(documentClient)

        const dynamoDb = new DynamoDb(documentClient)

        const isbnService = new IsbnService()

        this.dependencies.searchRouteHandler = new SearchRouteHandler(db, isbnService, dynamoDb)

        this.dependencies.coverImageRouteHandler = new CoverImageRouteHandler()

        console.log('Dependencies Instantiated')
        return {
            searchRouteHandler: this.dependencies.searchRouteHandler,
            coverImageRouteHandler: this.dependencies.coverImageRouteHandler,
        }
    }
}

export interface ConfigTypes {
    searchRouteHandler?: SearchRouteHandler,
    coverImageRouteHandler? : CoverImageRouteHandler
}

export default Config
