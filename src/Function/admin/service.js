import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { pushLine, createCaseFlexMessage } from './line.js'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

function caseKey(caseId) {
  return { PK: `CASE#${caseId}`, SK: 'METADATA' }
}

function agencyKey(agencyId) {
  return { PK: `AGENCY#${agencyId}`, SK: `METADATA#${agencyId}` }
}

// อัปเดต case เดียว → FORWARD + AgencyID, คืน null ถ้า skip (ไม่ใช่ PENDING)
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

export const assignReportService = async (caseId, agencyId, caseIds = []) => {
  const tableName = process.env.TABLE_TABLE_NAME
  if (!tableName) {
    return { statusCode: 500, data: { success: false, message: 'TABLE_TABLE_NAME is not configured' } }
  }

  // ถ้าไม่ได้ส่ง caseIds มา ใช้แค่ caseId เดียว
  const allIds = caseIds.length > 0 ? caseIds : [caseId]

  // ดึง primary case + agency พร้อมกัน
  const [primaryResult, agencyResult] = await Promise.all([
    client.send(new GetCommand({ TableName: tableName, Key: caseKey(caseId) })),
    client.send(new GetCommand({ TableName: tableName, Key: agencyKey(agencyId) })),
  ])

  if (!primaryResult.Item) {
    return { statusCode: 404, data: { success: false, message: 'Case not found' } }
  }
  if (!agencyResult.Item) {
    return { statusCode: 404, data: { success: false, message: 'Agency not found' } }
  }

  const primaryCase = primaryResult.Item
  const agency = agencyResult.Item

  // Update ทุก case พร้อมกัน
  const now = new Date().toISOString()
  const updateResults = await Promise.all(
    allIds.map(id => forwardOneCase(tableName, id, agencyId, now))
  )
  const forwarded = updateResults.filter(Boolean)

  if (forwarded.length === 0) {
    return { statusCode: 409, data: { success: false, message: 'No PENDING cases to forward' } }
  }

  // Push LINE ไปที่ agency (1 message สรุปทุก case)
  if (agency.LineUserID) {
    try {
      const flexMessage = createCaseFlexMessage(primaryCase, caseId, forwarded.length)
      await pushLine(agency.LineUserID, [flexMessage])
    } catch (err) {
      console.error('LINE push failed:', err)
    }
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: `Forwarded ${forwarded.length} case(s) to agency`,
      forwarded: forwarded.map(c => c.caseId),
    },
  }
}
