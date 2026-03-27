// agencies/index.js
import { acceptCase } from './handler.js'

export const handler = async (event) => {
  const { httpMethod, resource, pathParameters } = event

  if (httpMethod === 'POST' && resource === '/agencies/cases/{caseId}/accept'){
    const { caseId } = pathParameters || {}

    return acceptCase({...event, caseId})
  }
  return { 
    statusCode: 404, 
    body: JSON.stringify({ message: 'Not found' })
  }
}