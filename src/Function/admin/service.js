import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { pushLine, createCaseFlexMessage } from './line.js'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

function caseKey(caseId) {
  return { PK: `CASE#${caseId}`, SK: 'METADATA' }
}

// อัปเดต case เดียว → FORWARD + AssignedAgencyName, คืน null ถ้า skip (ไม่ใช่ PENDING)
async function forwardOneCase(tableName, caseId, agencyName, now) {
  try {
    const result = await client.send(new UpdateCommand({
      TableName: tableName,
      Key: caseKey(caseId),
      UpdateExpression: 'SET #st = :fwd, AssignedAgencyName = :agencyName, ForwardedAt = :now',
      ConditionExpression: '#st = :pending',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':fwd': 'FORWARD',
        ':pending': 'PENDING',
        ':agencyName': agencyName,
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

export const assignReportService = async (caseId, agencyName, caseIds = []) => {
  const tableName = process.env.TABLE_TABLE_NAME
  if (!tableName) {
    return { statusCode: 500, data: { success: false, message: 'TABLE_TABLE_NAME is not configured' } }
  }

  const allIds = caseIds.length > 0 ? caseIds : [caseId]

  // ดึง primary case + scan หา members ทั้งหมดของหน่วยงาน พร้อมกัน
  const [primaryResult, memberScan] = await Promise.all([
    client.send(new GetCommand({ TableName: tableName, Key: caseKey(caseId) })),
    client.send(new ScanCommand({
      TableName: tableName,
      FilterExpression: 'AgencyName = :name AND begins_with(PK, :prefix) AND #st = :active',
      ExpressionAttributeNames: { '#st': 'Status' },
      ExpressionAttributeValues: { ':name': agencyName, ':prefix': 'AGENCY#', ':active': 'ACTIVE' },
    })),
  ])

  if (!primaryResult.Item) {
    return { statusCode: 404, data: { success: false, message: 'Case not found' } }
  }

  const members = memberScan.Items || []
  if (members.length === 0) {
    return { statusCode: 404, data: { success: false, message: 'Agency not found or no active members' } }
  }

  // Forward ทุก case → set AssignedAgencyName
  const now = new Date().toISOString()
  const updateResults = await Promise.all(
    allIds.map(id => forwardOneCase(tableName, id, agencyName, now))
  )
  const forwarded = updateResults.filter(Boolean)

  if (forwarded.length === 0) {
    return { statusCode: 409, data: { success: false, message: 'No PENDING cases to forward' } }
  }

  // Push LINE ไปทุกคนในหน่วยงาน
  const primaryCase = primaryResult.Item
  await Promise.allSettled(
    members
      .filter(m => m.LineUserID)
      .map(m => {
        const flexMessage = createCaseFlexMessage(primaryCase, caseId, forwarded.length)
        return pushLine(m.LineUserID, [flexMessage]).catch(err => console.error('LINE push failed:', err))
      })
  )

  return {
    statusCode: 200,
    data: {
      success: true,
      message: `Forwarded ${forwarded.length} case(s) to agency "${agencyName}"`,
      forwarded: forwarded.map(c => c.caseId),
    },
  }
}
