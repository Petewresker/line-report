// cases/index.js
import { getCasesByUser, editCaseHandler, createCase, postCaseByUser, getPresignedUrl, gethotspot, getTrends, getResolution, deleteCase, getMonthlyReport, seedMockCases, deleteAllCases, deleteByCaseId } from './handler.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
}

export const handler = async (event) => {
  try {
    const { httpMethod, path, resource } = event

    if (httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' }

    //==================================== GET ====================================
    if (httpMethod === 'GET' && resource === '/cases/presigned-url') return getPresignedUrl(event)
    if (httpMethod === 'GET' && resource === '/cases')       return getCasesByUser(event)
    if (httpMethod === 'GET' && resource === '/cases/hotspots') return gethotspot()
    if (httpMethod === 'GET' && resource === '/cases/trends') return getTrends()
    if (httpMethod === 'GET' && resource === '/cases/resolution') return getResolution()
    if (httpMethod === 'GET' && resource === '/cases/monthly') return getMonthlyReport()

    //==================================== POST ====================================  
    if (httpMethod === 'POST' && resource === '/cases/{caseId}/edit') return editCaseHandler(event)
    if (httpMethod === 'POST' && resource === '/cases') return createCase(event)
    if (httpMethod === 'POST' && resource === '/cases/mockpost') return seedMockCases()

    //==================================== DELETE ====================================
    if (httpMethod === 'DELETE' && resource === '/cases/all') return deleteAllCases()
    if (httpMethod === 'DELETE' && resource === '/cases') return deleteCase(event)
    if (httpMethod === 'DELETE' && resource === '/cases/{caseId}') {return deleteByCaseId(event)}

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Not found', path, httpMethod }),
    }
  } catch (error) {
    console.error('Unhandled error:', error)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    }
  }
}
