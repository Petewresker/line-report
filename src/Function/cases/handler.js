// handler.js - validate แล้วเรียก service
import { editCaseService, getCasesByUserService, getAllCasesService, createCaseService } from './service.js'
export const editCaseHandler = async (event) => {
  const { caseId } = event.pathParameters
  const body = JSON.parse(event.body)
  const result = await editCaseService(caseId, body) 
  return { statusCode: 200, body: JSON.stringify(result) }
}

export const getCasesByUser = async (event) => {
  const { userId } = event.queryStringParameters || {}
  
  const result = userId 
    ? await getCasesByUserService(userId)
    // Endpoint GET /cases ดึงข้อมูลทั้งหมดได้เมื่อไม่มี userId 
    : await getAllCasesService() 
    
  return { statusCode: 200, body: JSON.stringify(result) }
}

export const createCase = async (event) => {
  const body = JSON.parse(event.body)

  const result = await createCaseService(body)
  return { statusCode: 201, body: JSON.stringify(result) }
}