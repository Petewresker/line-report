// service.js - แตะ DynamoDB
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
//ใช้คำสั่ง ScanCommand ของ DynamoDB เพื่อดึงข้อมูลทั้งหมดใน Table
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
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
  // Verify case exists
  const getResult = await client.send(new GetCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    Key: {
      PK: `CASE#${caseId}`,
      SK: 'METADATA',
    },
  }))

  if (!getResult.Item) {
    throw new Error('Case not found')
  }

  // Build update expression dynamically
  const updateExpressionParts = []
  const expressionAttributeNames = {}
  const expressionAttributeValues = {}

  if (data.description !== undefined) {
    updateExpressionParts.push('#desc = :description')
    expressionAttributeNames['#desc'] = 'description'
    expressionAttributeValues[':description'] = data.description
  }

  if (data.location) {
    if (data.location.lat !== undefined) {
      updateExpressionParts.push('lat = :lat')
      expressionAttributeValues[':lat'] = data.location.lat
    }
    if (data.location.long !== undefined) {
      updateExpressionParts.push('lon = :lon')
      expressionAttributeValues[':lon'] = data.location.long
    }
  }

  if (data.imageUrlBefore !== undefined) {
    updateExpressionParts.push('imageUrlBefore = :imageUrlBefore')
    expressionAttributeValues[':imageUrlBefore'] = data.imageUrlBefore
  }

  if (updateExpressionParts.length === 0) {
    throw new Error('No fields to update')
  }

  //update timestamp
  updateExpressionParts.push('updatedAt = :updatedAt')
  expressionAttributeValues[':updatedAt'] = new Date().toISOString()

  // Execute update
  const updateResult = await client.send(new UpdateCommand({
    TableName: process.env.TABLE_TABLE_NAME,
    Key: {
      PK: `CASE#${caseId}`,
      SK: 'METADATA',
    },
    UpdateExpression: 'SET ' + updateExpressionParts.join(', '),
    ...(Object.keys(expressionAttributeNames).length > 0 && { ExpressionAttributeNames: expressionAttributeNames }),
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  }))

  return updateResult.Attributes
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