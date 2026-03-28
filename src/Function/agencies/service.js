import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "ap-southeast-1",
  endpoint: "http://host.docker.internal:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "IncidentReports-local";

export async function getCaseById(agencyId, caseId) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: agencyId,
        SK: caseId
      }
    })
  );

  return result.Item;
}

export async function getCasesByAgencyId(agencyId) {
  const result = await dynamoDB.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :agencyId",
      ExpressionAttributeValues: {
        ":agencyId": agencyId
      }
    })
  );

  return result.Items || [];
}
