// handler.js - validate แล้วเรียก service
import { editCaseService, getCasesByUserService, getAllCasesService, getAllCasesAdminService, createCaseService, postCaseService, getPresignedUrlService, HostspotService, trendAnalysisService, ResolutionTime, deleteCasesByUserService, monthlyReportService, deleteAllCasesService } from './service.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}

export const getPresignedUrl = async (event) => {
  try {
    const { filename, contentType } = event.queryStringParameters || {}
    if (!filename || !contentType) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'filename and contentType are required' }) }
    }
    const result = await getPresignedUrlService(filename, contentType)
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getPresignedUrl error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to generate presigned URL', message: error.message }) }
  }
}
export const getCasesByUser = async (event) => {
  try {
    const { userId, admin } = event.queryStringParameters || {}
    const result = admin === 'true'
      ? await getAllCasesAdminService()
      : userId
        ? await getCasesByUserService(userId)
        : await getAllCasesService()
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getCasesByUser error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: error.message }) }
  }
}

export const editCaseHandler = async (event) => {
  try {
    const { caseId } = event.pathParameters
    const body = JSON.parse(event.body)
    const result = await editCaseService(caseId, body)
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('editCaseHandler error:', error)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to edit case', message: error.message }),
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
}

export const createCase = async (event) => {
  const body = JSON.parse(event.body)

  const result = await createCaseService(body)
  return { statusCode: 201, headers: CORS_HEADERS, body: JSON.stringify(result) }
}

export const gethotspot = async () =>{

  try {
      const result = await HostspotService();
      return { statusCode: 201, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
      console.error('gethotspot error:', error)
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Failed to get hotspot', message: error.message }),
    }
}
}

export const getTrends = async () => {
  try {
    const result = await trendAnalysisService()
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getTrends error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to get trends', message: error.message }) }
  }
}

export const getResolution = async () => {
  try {
    const result = await ResolutionTime()
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getResolution error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to get resolution', message: error.message }) }
  }
}


export const seedMockCases = async () => {
  try {
    const result = await postCaseService()
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('seedMockCases error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: error.message }) }
  }
}

export const getMonthlyReport = async () => {
  try {
    const result = await monthlyReportService()
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getMonthlyReport error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to get monthly report', message: error.message }) }
  }
}

export const deleteCase = async (event) => {
  try {
    const { userId } = event.queryStringParameters || {}
    if (!userId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'userId is required' }) }
    }
    const result = await deleteCasesByUserService(userId)
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('deleteCase error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to delete cases', message: error.message }) }
  }
}

export const deleteAllCases = async () => {
  try {
    const result = await deleteAllCasesService()
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) }
  } catch (error) {
    console.error('deleteAllCases error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to delete all cases', message: error.message }) }
  }
}


