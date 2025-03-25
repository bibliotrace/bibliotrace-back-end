import {
  CreateTableCommand,
  CreateTableCommandInput,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export async function createIsbnQueryCacheTable(
  documentClient: DynamoDBDocumentClient
): Promise<void> {
  const tableName = process.env.DYNAMO_ISBN_TABLE;

  let isCreated = false;

  while (!isCreated) {
    try {
      await documentClient.send(new DescribeTableCommand({ TableName: tableName }));
      isCreated = true;
    } catch (err) {
      if (err.name === "ResourceNotFoundException") {
        console.log(`Starting ${tableName} table creation...`);
        isCreated = true;
      } else if (err.code && err.code === "ECONNREFUSED") {
        setTimeout(() => {}, 1000); // stupid hack to wait for the connection to be established
      } else {
        // console.log(err);
        throw new Error(err);
      }
    }
  }

  const params: CreateTableCommandInput = {
    TableName: tableName,
    KeySchema: [{ AttributeName: "query", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "query", AttributeType: "S" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    await documentClient.send(new CreateTableCommand(params));
    console.log(`Table Created Successfully`);
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}
