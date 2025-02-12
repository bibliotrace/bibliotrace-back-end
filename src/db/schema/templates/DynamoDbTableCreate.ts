import { CreateTableCommand, CreateTableCommandInput, DescribeTableCommand } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

export async function createIsbnQueryCacheTable (documentClient: DynamoDBDocumentClient): Promise<void> {
    const tableName = process.env.DYNAMO_ISBN_TABLE
    
    try {
        await documentClient.send(new DescribeTableCommand({ TableName: tableName }))
        console.log(`${tableName} already exists. Skipping its creation.`)
        return
    } catch (err) {
        if (err.name === "ResourceNotFoundException") {
            console.log(`Starting ${tableName} table creation...`)
        } else {
            throw new Error(err)
        }
    }

    const params: CreateTableCommandInput = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: 'query', KeyType: 'HASH'}
        ],
        AttributeDefinitions: [
            { AttributeName: 'query', AttributeType: 'S'}
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits:5
        }
    }

    try {
        const data = await documentClient.send(new CreateTableCommand(params))
        console.log(`Table Created Successfully`)
    } catch (err) {
        console.log(`Error: ${err}`)
    }
}