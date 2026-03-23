// service.js - แตะ DynamoDB
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const editCaseService = async (caseId, data) => {
  // update DynamoDB ตรงนี้
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