import { acceptCaseService, completeCaseService, getAgencyCaseHandler, getAgencyCasesHandler } from './service.js'

// ─────────────────────────────────────────────
// 1. รับเรื่อง
// POST /agencies/cases/{caseId}/accept
// ─────────────────────────────────────────────
export const acceptCaseHandler = async (event) => {
  const { caseId } = event.pathParameters

  console.log('[accept] caseId:', caseId) //ดู

  if (!caseId) {
    console.log('[accept] ERROR: ไม่มี caseId')
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'caseId จำเป็นต้องมี' })
    }
  }

  const result = await acceptCaseService(caseId)

  console.log('[accept] DynamoDB result:', JSON.stringify(result)) //ดู

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'รับเรื่องสำเร็จ', data: result })
  }
}

// ─────────────────────────────────────────────
// 2. ปิดเคส
// POST /agencies/cases/{caseId}/complete
// body: { "imageUrlAfter": "...", "Summary": "..." }
// ─────────────────────────────────────────────
export const completeCaseHandler = async (event) => {
  const { caseId } = event.pathParameters
  const body = JSON.parse(event.body || '{}')
  const { imageUrlAfter, Summary } = body

  console.log('[complete] caseId:', caseId) //ดู
  console.log('[complete] body:', JSON.stringify(body))  //ดู

  if (!caseId) {
    console.log('[complete] ERROR: ไม่มี caseId') //ดู
    return { statusCode: 400, body: JSON.stringify({ message: 'caseId จำเป็นต้องมี' }) }
  }
  if (!imageUrlAfter || !Summary) {
    console.log('[complete] ERROR: body ไม่ครบ') //ดู
    return { statusCode: 400, body: JSON.stringify({ message: 'imageUrlAfter และ Summary จำเป็นต้องมี' }) }
  }

  const result = await completeCaseService(caseId, imageUrlAfter, Summary)
  console.log('[complete] DynamoDB result:', JSON.stringify(result)) //ดู
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'ปิดเคสสำเร็จ', data: result })
  }
}

// ─────────────────────────────────────────────
// 3. ดูเคสเดียว
// GET /agencies/{agencyId}/cases/{caseId}
// ─────────────────────────────────────────────
export const getAgencyCaseHandler = async (event) => {
  const { agencyId, caseId } = event.pathParameters

  if (!agencyId || !caseId) {
    return { statusCode: 400, body: JSON.stringify({ message: 'agencyId และ caseId จำเป็นต้องมี' }) }
  }

  const result = await getAgencyCaseService(agencyId, caseId)

  // ถ้าไม่เจอ item ใน DynamoDB
  if (!result) {
    return { statusCode: 404, body: JSON.stringify({ message: 'ไม่พบเคสนี้' }) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: result })
  }
}

// ─────────────────────────────────────────────
// 4. ดูเคสทั้งหมดของหน่วยงาน
// GET /agencies/{agencyId}/cases
// ─────────────────────────────────────────────
export const getAgencyCasesHandler = async (event) => {
  const { agencyId } = event.pathParameters

  if (!agencyId) {
    return { statusCode: 400, body: JSON.stringify({ message: 'agencyId จำเป็นต้องมี' }) }
  }

  const result = await getAgencyCasesService(agencyId)
  return {
    statusCode: 200,
    body: JSON.stringify({ data: result })
  }
}
