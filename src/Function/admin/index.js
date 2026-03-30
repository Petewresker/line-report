// admin/index.js
import { assignReport, handleCreateAdmin, handleGetMyAdmin } from './handler.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
}

export const handler = async (event) => {
  try {
    const { httpMethod, path, pathParameters } = event

    if (httpMethod === 'POST' && path === '/admin/users') {
      return handleCreateAdmin(event)
    }

    if (httpMethod === 'GET' && path === '/admin/me') {
      return handleGetMyAdmin(event)
    }

    if (httpMethod === 'POST' && path.match(/^\/admin\/cases\/[^/]+\/assign$/)) {
      const { caseId } = pathParameters || {}
      return assignReport({ ...event, caseId })
    }

    if (httpMethod === 'POST' && path.includes('/admin/cases') && path.includes('/agencies')) {
      const { caseId } = pathParameters || {}
      return assignReport({ ...event, caseId })
    }

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
