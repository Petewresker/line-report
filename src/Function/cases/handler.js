// handler.js - validate แล้วเรียก service
import { editCaseService, getCasesByUserService, getAllCasesService, createCaseService, postCaseService, getPresignedUrlService } from './service.js'

export const getPresignedUrl = async (event) => {
  try {
    const { filename, contentType } = event.queryStringParameters || {}
    if (!filename || !contentType) {
      return { statusCode: 400, body: JSON.stringify({ error: 'filename and contentType are required' }) }
    }
    const result = await getPresignedUrlService(filename, contentType)
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getPresignedUrl error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate presigned URL', message: error.message }) }
  }
}
export const editCaseHandler = async (event) => {
  try {
    const { caseId } = event.pathParameters
    const body = JSON.parse(event.body)
    const result = await editCaseService(caseId, body)
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (error) {
    console.error('editCaseHandler error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to edit case', message: error.message }),
    }
  }
}

export const getCasesByUser = async (event) => {
  try {
    const { userId } = event.queryStringParameters || {}
    const result = userId
      ? await getCasesByUserService(userId)
      : await getAllCasesService()
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getCasesByUser error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get cases', message: error.message }),
    }
  }
}

export const postCaseByUser = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const result = await postCaseService(body)
    return result
  } catch (error) {
    console.error('postCaseByUser error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to post case', message: error.message }),
    }
  }
  // const { userId } = event.queryStringParameters || {}
  
  // const result = userId 
  //   ? await getCasesByUserService(userId)
  //   // Endpoint GET /cases ดึงข้อมูลทั้งหมดได้เมื่อไม่มี userId 
  //   : await getAllCasesService() 
    
  // return { statusCode: 200, body: JSON.stringify(result) }
}

export const createCase = async (event) => {
  const body = JSON.parse(event.body)

  const result = await createCaseService(body)
  return { statusCode: 201, body: JSON.stringify(result) }
}