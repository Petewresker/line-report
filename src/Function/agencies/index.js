import { acceptCaseHandler, completeCaseHandler } from './handler.js'

export const handler = async (event) => {
  console.log(JSON.stringify(event, undefined, 2))

  const method = event.httpMethod
  const path = event.path

  // POST /agencies/cases/{caseId}/accept
  if (method === 'POST' && path.endsWith('/accept')) {
    return await acceptCaseHandler(event)
  }

  // POST /agencies/cases/{caseId}/complete
  if (method === 'POST' && path.endsWith('/complete')) {
    return await completeCaseHandler(event)
  }

  // GET /agencies/{agencyId}/cases/{caseId}
  // path มี 2 segment หลัง /cases/ → ต้องเช็คว่ามี caseId ด้วย
  if (method === 'GET' && event.pathParameters?.caseId) {
    return await getAgencyCaseHandler(event)
  }

  // GET /agencies/{agencyId}/cases
  if (method === 'GET') {
    return await getAgencyCasesHandler(event)
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not Found' })
  }
}
