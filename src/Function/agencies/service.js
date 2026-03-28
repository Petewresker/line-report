import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.TABLE_TABLE_NAME

// ─────────────────────────────────────────────
// 1. รับเรื่อง: เปลี่ยน status → in_progress
// ─────────────────────────────────────────────
export const acceptCaseService = async (caseId) => {
  // UpdateCommand = อัปเดตบางฟิลด์ใน DynamoDB โดยไม่ต้องเขียนทับทั้ง item
  const result = await client.send(new UpdateCommand({
    TableName: TABLE,
    Key: {
      PK: `CASE#${caseId}`,  // Primary Key
      SK: `CASE#${caseId}`,  // Sort Key
    },
    // SET คือบอกว่าจะอัปเดตฟิลด์ไหน
    UpdateExpression: 'SET #status = :status, UpdatedAt = :updatedAt',
    // ExpressionAttributeNames ใช้เพราะ "status" เป็น reserved word ใน DynamoDB
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'in_progress',
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW', // ให้ return ข้อมูลหลังอัปเดตกลับมาด้วย
  }))
  return result.Attributes
}

// ─────────────────────────────────────────────
// 2. ปิดเคส: บันทึกรูปหลังทำงาน + summary
// ─────────────────────────────────────────────
export const completeCaseService = async (caseId, imageUrlAfter, summary) => {
  const result = await client.send(new UpdateCommand({
    TableName: TABLE,
    Key: {
      PK: `CASE#${caseId}`,
      SK: `CASE#${caseId}`,
    },
    UpdateExpression: 'SET #status = :status, imageUrlAfter = :imageUrlAfter, Summary = :summary, UpdatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'completed',
      ':imageUrlAfter': imageUrlAfter,
      ':summary': summary,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  }))
  return result.Attributes
}

// ─────────────────────────────────────────────
// 3. ดูเคสเดียว ด้วย agencyId + caseId
// ─────────────────────────────────────────────
export const getAgencyCaseService = async (agencyId, caseId) => {
  // GetCommand = ดึง item เดียวด้วย PK + SK ตรงๆ
  const result = await client.send(new GetCommand({
    TableName: TABLE,
    Key: {
      PK: `AGENCY#${agencyId}`,
      SK: `CASE#${caseId}`,
    },
  }))
  return result.Item // ถ้าไม่เจอจะเป็น undefined
}

// ─────────────────────────────────────────────
// 4. ดูเคสทั้งหมดของหน่วยงาน ด้วย agencyId
// ─────────────────────────────────────────────
export const getAgencyCasesService = async (agencyId) => {
  // QueryCommand = ดึงหลาย item โดยใช้ GSI_1_Agency_Portal
  const result = await client.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'GSI_1_Agency_Portal', // ใช้ GSI ที่กำหนดใน template.yaml
    KeyConditionExpression: 'AgencyID = :agencyId',
    ExpressionAttributeValues: {
      ':agencyId': agencyId,
    },
  }))
  return result.Items
}
