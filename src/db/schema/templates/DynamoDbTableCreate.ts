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
  let numConnectionFailures = 0;
  const maxConnectionFailures = 10; // doesn't really matter what this is, just here to ensure no infinite loop

  while (!isCreated) {
    try {
      await documentClient.send(new DescribeTableCommand({ TableName: tableName }));
      isCreated = true;
    } catch (err) {
      if (err.name === "ResourceNotFoundException") {
        console.log(`Starting ${tableName} table creation...`);
        isCreated = true;
      } else if (err.code && err.code === "ECONNREFUSED") {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // stupid hack to wait for the connection to be established
        numConnectionFailures++;
        if (numConnectionFailures >= maxConnectionFailures) {
          console.log("Max connection failures reached. Exiting...");
          process.exit(1);
        }
        console.log(`Connection refused. Retrying... (${numConnectionFailures})`);
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
