// admin/index.js
import { assignReport, handleCreateAdmin, handleDeleteAdmin, handleGetMyAdmin } from './handler.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
}

export const handler = async (event) => {
  try {
    const { httpMethod, resource, pathParameters } = event

    // ===================================== GET ====================================
    if (httpMethod === 'GET' && resource === '/admin/me') { return handleGetMyAdmin(event) }

    // ===================================== POST ====================================
    if (httpMethod === 'POST' && resource === '/admin/users') { return handleCreateAdmin(event) }
    if (httpMethod === 'POST' && resource === '/admin/cases/{caseId}/assign') {
      const { caseId } = pathParameters || {}
      return assignReport({ ...event, caseId })
    }

    if (httpMethod === 'POST' && resource === '/admin/cases/{caseId}/agencies/{agencyId}') {
      const { caseId } = pathParameters || {}
      return assignReport({ ...event, caseId })
    }

    // ===================================== DELETE ====================================
    if (httpMethod === 'DELETE' && resource === '/admin/users') { return handleDeleteAdmin(event) }

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
