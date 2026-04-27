import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { pushLine, createCaseFlexMessage } from './line.js'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const s3 = new S3Client({ requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' })

async function getImageUrl(key) {
  if (!key) return null
  if (key.startsWith('http')) return key
  const cmd = new GetObjectCommand({ Bucket: process.env.IMAGEBUCKET_BUCKET_NAME, Key: key })
  return getSignedUrl(s3, cmd, { expiresIn: 3600 })
}

function caseKey(caseId) {
  return { PK: `CASE#${caseId}`, SK: 'METADATA' }
}

// อัปเดต case เดียว → FORWARD + AssignedAgencyID, คืน null ถ้า skip (ไม่ใช่ PENDING)
async function forwardOneCase(tableName, caseId, agencyId, now) {
  try {
    const result = await client.send(new UpdateCommand({
      TableName: tableName,
      Key: caseKey(caseId),
      UpdateExpression: 'SET #st = :fwd, AssignedAgencyID = :agencyId, ForwardedAt = :now',
      ConditionExpression: '#st = :pending',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':fwd': 'FORWARD',
        ':pending': 'PENDING',
        ':agencyId': agencyId,
        ':now': now,
      },
      ReturnValues: 'ALL_NEW',
    }))
    return result.Attributes
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') return null
    throw err
  }
}

export const deleteAdminService = async (lineUserId) => {
  const tableName = process.env.TABLE_TABLE_NAME
  const result = await client.send(new DeleteCommand({
    TableName: tableName,
    Key: { PK: `ADMIN#${lineUserId}`, SK: 'METADATA' },
    ConditionExpression: 'attribute_exists(PK)',
    ReturnValues: 'ALL_OLD',
  }))

  if (result.Attributes) {
    // Reset User record role → user
    await client.send(new UpdateCommand({
      TableName: tableName,
      Key: { PK: `USER#${lineUserId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET #role = :role',
      ExpressionAttributeNames: { '#role': 'role' },
      ExpressionAttributeValues: { ':role': 'user' },
    }))
  }

  return result.Attributes ?? null
}

export const createAdminService = async (lineUserId, name) => {
  const tableName = process.env.TABLE_TABLE_NAME
  const adminId = randomUUID()
  const now = new Date().toISOString()

  const item = {
    PK: `ADMIN#${lineUserId}`,
    SK: 'METADATA',
    AdminID: adminId,
    LineUserID: lineUserId,
    Name: name,
    CreatedAt: now,
  }

  await client.send(new PutCommand({ TableName: tableName, Item: item }))

  // Patch User record role → admin
  await client.send(new UpdateCommand({
    TableName: tableName,
    Key: { PK: `USER#${lineUserId}`, SK: 'PROFILE' },
    UpdateExpression: 'SET #role = :role',
    ExpressionAttributeNames: { '#role': 'role' },
    ExpressionAttributeValues: { ':role': 'admin' },
  }))

  return item
}

export const getAdminByUserIdService = async (lineUserId) => {
  const tableName = process.env.TABLE_TABLE_NAME
  const result = await client.send(new GetCommand({
    TableName: tableName,
    Key: { PK: `ADMIN#${lineUserId}`, SK: 'METADATA' },
  }))
  return result.Item ?? null
}

export const assignReportService = async (caseId, agencyId, caseIds = []) => {
  const tableName = process.env.TABLE_TABLE_NAME
  if (!tableName) {
    return { statusCode: 500, data: { success: false, message: 'TABLE_TABLE_NAME is not configured' } }
  }

  const allIds = caseIds.length > 0 ? caseIds : [caseId]

  const [primaryResult, agencyResult] = await Promise.all([
    client.send(new GetCommand({ TableName: tableName, Key: caseKey(caseId) })),
    client.send(new GetCommand({ TableName: tableName, Key: { PK: `AGENCY#${agencyId}`, SK: `METADATA#${agencyId}` } })),
  ])

  if (!primaryResult.Item) {
    return { statusCode: 404, data: { success: false, message: 'Case not found' } }
  }
  if (primaryResult.Item.status !== 'PENDING') {
    return { statusCode: 400, data: { success: false, message: `Cannot assign case with status "${primaryResult.Item.status}". Only PENDING cases can be assigned.` } }
  }
  const member = agencyResult.Item
  if (!member) {
    return { statusCode: 404, data: { success: false, message: 'Agency not found' } }
  }
  if (member.Status !== 'ACTIVE') {
    return { statusCode: 400, data: { success: false, message: 'Agency is not active' } }
  }

  const now = new Date().toISOString()
  const updateResults = await Promise.all(
    allIds.map(id => forwardOneCase(tableName, id, agencyId, now))
  )
  const forwarded = updateResults.filter(Boolean)

  if (forwarded.length === 0) {
    return { statusCode: 409, data: { success: false, message: 'No PENDING cases to forward' } }
  }

  // Push LINE ไปหาคนที่ assign
  if (member.LineUserID) {
    const imageUrl = await getImageUrl(primaryResult.Item.imageUrlBefore)
    const flexMessage = createCaseFlexMessage(primaryResult.Item, caseId, forwarded.length, imageUrl)
    await pushLine(member.LineUserID, [flexMessage]).catch(err => console.error('LINE push failed:', err))
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: `Forwarded ${forwarded.length} case(s) to agency "${member.AgencyName}"`,
      forwarded: forwarded.map(c => c.caseId),
    },
  }
}

// อัปเดต case เดียว → REJECTED, คืน null ถ้า skip (ไม่ใช่ PENDING)
async function rejectOneCase(tableName, caseId, now) {
  try {
    const result = await client.send(new UpdateCommand({
      TableName: tableName,
      Key: caseKey(caseId),
      UpdateExpression: 'SET #st = :rejected, RejectedAt = :now',
      ConditionExpression: '#st = :pending',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':rejected': 'REJECTED',
        ':pending': 'PENDING',
        ':now': now,
      },
      ReturnValues: 'ALL_NEW',
    }))
    return result.Attributes
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') return null
    throw err
  }
}

export const rejectCaseService = async (caseId, caseIds = []) => {
  const tableName = process.env.TABLE_TABLE_NAME
  if (!tableName) {
    return { statusCode: 500, data: { success: false, message: 'TABLE_TABLE_NAME is not configured' } }
  }

  const allIds = caseIds.length > 0 ? caseIds : [caseId]

  const primaryResult = await client.send(new GetCommand({ TableName: tableName, Key: caseKey(caseId) }))
  if (!primaryResult.Item) {
    return { statusCode: 404, data: { success: false, message: 'Case not found' } }
  }
  if (primaryResult.Item.status !== 'PENDING') {
    return { statusCode: 400, data: { success: false, message: `Cannot reject case with status "${primaryResult.Item.status}". Only PENDING cases can be rejected.` } }
  }

  const now = new Date().toISOString()
  const updateResults = await Promise.all(
    allIds.map(id => rejectOneCase(tableName, id, now))
  )
  const rejected = updateResults.filter(Boolean)

  if (rejected.length === 0) {
    return { statusCode: 409, data: { success: false, message: 'No PENDING cases to reject' } }
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: `Rejected ${rejected.length} case(s)`,
      rejected: rejected.map(c => c.caseId),
    },
  }
}
