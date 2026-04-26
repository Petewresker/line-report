// cases/index.js
import { getCasesByUser, editCaseHandler, createCase, postCaseByUser, getPresignedUrl, gethotspot, getTrends, getResolution, getMonthlyReport } from './handler.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
}

export const handler = async (event) => {
  try {
    const { httpMethod, path, resource } = event

    //API เทสระบบว่ามีปลายทางไหม
    if (httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' }

    if (httpMethod === 'GET' && resource === '/cases/presigned-url') return getPresignedUrl(event)
    if (httpMethod === 'GET' && resource === '/cases')       return getCasesByUser(event)
    if (httpMethod === 'POST' && resource === '/cases/{caseId}/edit') return editCaseHandler(event)
    if (httpMethod === 'POST' && resource === '/cases') return createCase(event)
    //สําหรับการวิเคราะห์ข้อมูล
    if (httpMethod === 'GET' && resource === '/cases/hotspots') return gethotspot(event)
    if (httpMethod === 'GET' && resource === '/cases/trends') return getTrends(event)
    if (httpMethod === 'GET' && resource === '/cases/resolution') return getResolution(event)
    if (httpMethod === 'GET' && resource === '/cases/monthly') return getMonthlyReport(event)

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Not found', resource, httpMethod }),
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
