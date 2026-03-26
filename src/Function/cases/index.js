// cases/index.js
import { getCasesByUser, editCaseHandler, createCase } from './handler.js'

export const handler = async (event) => {
  const { httpMethod, path } = event

  if (httpMethod === 'GET' && path === '/cases')       return getCasesByUser(event)
  if (httpMethod === 'POST' && path.includes('/edit')) return editCaseHandler(event)
  if (httpMethod === 'POST' && path === '/cases') return createCase(event)

  return { statusCode: 404, body: 'Not found' }
}