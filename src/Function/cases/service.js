import { randomUUID } from 'crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { mockData } from './mockData.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export const editCaseService = async (caseId, data) => {
  // update DynamoDB ตรงนี้
}

export const getCasesByUserService = async (userId) => {
  const result = await docClient.send(new QueryCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
  }))
  return result.Items
}

export const getAllCasesService = async () => {
  const result = await docClient.send(new ScanCommand({
    TableName: process.env.TABLE_TABLE_NAME,
  }))
  return result.Items
}

//Loop MockData Test เราแนะนําให้ใช้ docClient แทน Client
export const postCaseService = async (body) => {
  const results = [];

  for (const mock of mockData) {
    const reportId = randomUUID();

    try {
      await docClient.send(new PutCommand({
        TableName: process.env.TABLE_TABLE_NAME,
        Item: {
          PK: `REPORT#${reportId}`,
          SK: `METADATA#${reportId}`,
          ReporterID: mock.userId,
          Title: mock.Topic,
          Description: mock.description,
          Status: "PENDING",
          PhotoURL_Before: mock.imageUrlBefore,
          PhotoURL_After: null,
          Lat: mock.location.lat,
          Lng: mock.location.long,
          AI_Suggested_Category: "",
          AI_Confidence: 0,
          AssignedAgencyID: "",
          CreatedAt: new Date().toISOString(),
          AcceptedAt: null,
          ResolvedAt: null,
          Summary: "",
        },
      }));
      results.push({ reportId, topic: mock.Topic, status: "success" });
    } catch (error) {
      results.push({ reportId, topic: mock.Topic, status: "failed", error: error.message });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Seeded ${results.filter(r => r.status === "success").length}/${mockData.length} cases`,
      results,
    }),
  };
}