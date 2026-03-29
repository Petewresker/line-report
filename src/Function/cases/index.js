// cases/index.js
import { getCasesByUser, editCaseHandler, createCase, postCaseByUser, getPresignedUrl, gethotspot, getTrends, getResolution, deleteCase, getMonthlyReport, seedMockCases } from './handler.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
}

export const handler = async (event) => {
  try {
    const { httpMethod, path } = event

    if (httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' }

    if (httpMethod === 'GET' && path === '/cases/presigned-url') return getPresignedUrl(event)
    if (httpMethod === 'GET' && path === '/cases')       return getCasesByUser(event)
    if (httpMethod === 'POST' && path.includes('/edit')) return editCaseHandler(event)
    if (httpMethod === 'POST' && path === '/cases') return createCase(event)
    if (httpMethod === 'GET' && path === '/cases/hotspots') return gethotspot()
    if (httpMethod === 'GET' && path === '/cases/trends') return getTrends()
    if (httpMethod === 'GET' && path === '/cases/resolution') return getResolution()
    if (httpMethod === 'DELETE' && path === '/cases') return deleteCase(event)
    if (httpMethod === 'GET' && path === '/cases/monthly') return getMonthlyReport()
    if (httpMethod === 'POST' && path === '/cases/mockpost') return seedMockCases()

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
