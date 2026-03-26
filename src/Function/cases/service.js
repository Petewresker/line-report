// service.js - แตะ DynamoDB
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
//ใช้คำสั่ง ScanCommand ของ DynamoDB เพื่อดึงข้อมูลทั้งหมดใน Table
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import crypto from 'node:crypto'

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