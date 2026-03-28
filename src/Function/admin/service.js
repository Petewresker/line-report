import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { pushLine, createCaseFlexMessage } from './line.js'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

function reportKey(caseId) {
  return {
    PK: `REPORT#${caseId}`,
    SK: `METADATA#${caseId}`,
  }
}

function agencyKey(agencyId) {
  return {
    PK: `AGENCY#${agencyId}`,
    SK: `METADATA#${agencyId}`,
  }
}

export const assignReportService = async (caseId, agencyId) => {
  const tableName = process.env.TABLE_TABLE_NAME
  if (!tableName) {
    return { statusCode: 500, data: { success: false, message: 'TABLE_TABLE_NAME is not configured' } }
  }

  const reportResult = await client.send(new GetCommand({
    TableName: tableName,
    Key: reportKey(caseId),
  }))

  if (!reportResult.Item) {
    return { statusCode: 404, data: { success: false, message: 'Report not found' } }
  }

  const agencyResult = await client.send(new GetCommand({
    TableName: tableName,
    Key: agencyKey(agencyId),
  }))

  if (!agencyResult.Item) {
    return { statusCode: 404, data: { success: false, message: 'Agency not found' } }
  }

  const report = reportResult.Item
  const agency = agencyResult.Item

  if (report.Status !== 'PENDING') {
    return { statusCode: 409, data: { success: false, message: 'This case can only be updated when its status is PENDING.' } }
  }

  const now = new Date().toISOString()

  let updatedReport
  try {
    const updateResult = await client.send(new UpdateCommand({
      TableName: tableName,
      Key: reportKey(caseId),
      UpdateExpression: 'SET #Status = :newStatus, AssignedAgencyID = :assignedAgencyId, AcceptedAt = :acceptedAt',
      ConditionExpression: '#Status = :pending',
      ExpressionAttributeNames: {
        '#Status': 'Status',
      },
      ExpressionAttributeValues: {
        ':newStatus': 'FORWARDED',
        ':pending': 'PENDING',
        ':assignedAgencyId': agencyId,
        ':acceptedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    }))

    updatedReport = updateResult.Attributes
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return { statusCode: 409, data: { success: false, message: 'This case can only be updated when its status is PENDING.' } }
    }

    console.error('DynamoDB update failed:', error)
    return { statusCode: 500, data: { success: false, message: 'Failed to update report' } }
  }

  try {
    const flexMessage = createCaseFlexMessage(updatedReport, caseId, `https://your-app-domain.com/case-detail/${caseId}`) // รอ Deploy แล้วกำหนด Environment Variable
    await pushLine(agency.LineUserID, [flexMessage])
  } catch (error) {
    console.error('Failed to send LINE push message:', error)
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: 'The case has been successfully assigned to the agency.',
      data: updatedReport,
    },
  }
}
