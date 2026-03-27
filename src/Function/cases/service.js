import { randomUUID } from 'crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
//ใช้คำสั่ง ScanCommand ของ DynamoDB เพื่อดึงข้อมูลทั้งหมดใน Table
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import crypto from 'node:crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// For DyamoDB Local testing
const clientConfig = {}
console.log('DYNAMODB_ENDPOINT=', process.env.DYNAMODB_ENDPOINT)
console.log('TABLE_TABLE_NAME=', process.env.TABLE_TABLE_NAME)

if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT
  clientConfig.region = 'us-east-1'
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  }
}

const client = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig))
const s3Client = new S3Client({})

export const getPresignedUrlService = async (filename, contentType) => {
  const key = `images/${randomUUID()}-${filename}`
  const command = new PutObjectCommand({
    Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
  return { uploadUrl, key }
}

export const editCaseService = async (caseId, data) => {
  
}

export const getCasesByUserService = async (userId) => {
  const result = await client.send(new QueryCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
  }))
  return result.Items
}

export const getAllCasesService = async () => {
  const result = await client.send(new ScanCommand({
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

export const createCaseService = async (caseInformation) => {
  const caseId = crypto.randomUUID()
  const now = new Date().toISOString()

  const item = {
    PK: `CASE#${caseId}`,
    SK: 'METADATA',
    caseId,
    title: caseInformation.title,
    description: caseInformation.description,
    userId: caseInformation.userId,
    lat: caseInformation.lat,
    lon: caseInformation.lon,
    imageUrlBefore: caseInformation.imageUrlBefore,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  }

  await client.send(new PutCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    Item: item,
  }))
  
  return item
}