// handler.js - validate แล้วเรียก service
import { editCaseService, getCasesByUserService, getAllCasesService, getAllCasesAdminService, createCaseService, getPresignedUrlService, HostspotService, trendAnalysisService, ResolutionTime, monthlyReportService, deleteAllCasesService } from './service.js'
import { fromCookie, verify as verifyJWT } from './extractJWT.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE',
}

function withCors(response) {
  return { ...response, headers: { ...CORS_HEADERS, ...(response.headers ?? {}) } }
}

function requireAuth(event = {}) {
  const token = fromCookie(event.headers)

  if (!token) {
    return {
      ok: false,
      response: {
        statusCode: 401,
        body: JSON.stringify({ message: 'No token provided' }),
      },
    }
  }

  try {
    const decoded = verifyJWT(token)
    return {
      ok: true,
      user: {
        userId: decoded.userId,
        role: decoded.role,
        agencyId: decoded.agencyId,
      },
    }
  } catch (err) {
    return {
      ok: false,
      response: {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid or expired token' }),
      },
    }
  }
}

function requireRole(user, allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(user.role)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: 'You do not have permission to access this resource',
        requiredRoles: roles,
        currentRole: user.role || null,
      }),
    }
  }
  return null
}

// GET /cases/presigned-url
export const getPresignedUrl = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  try {
    const { filename, contentType } = event.queryStringParameters || {}
    if (!filename || !contentType) {
      return withCors({ statusCode: 400, body: JSON.stringify({ error: 'filename and contentType are required' }) })
    }
    const result = await getPresignedUrlService(filename, contentType)
    return withCors({ statusCode: 200, body: JSON.stringify(result) })
  } catch (error) {
    console.error('getPresignedUrl error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to generate presigned URL', message: error.message }) })
  }
}

// GET /cases
export const getCasesByUser = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  try {
    const { admin } = event.queryStringParameters || {}
    const result = (admin === 'true' && auth.user.role === 'admin')
      ? await getAllCasesAdminService()
      : await getCasesByUserService(auth.user.userId)
    return withCors({ statusCode: 200, body: JSON.stringify(result) })
  } catch (error) {
    console.error('getCasesByUser error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: error.message }) })
  }
}

// POST /cases/{caseId}/edit
export const editCaseHandler = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  try {
    const { caseId } = event.pathParameters
    const body = JSON.parse(event.body)
    const result = await editCaseService(caseId, body, auth.user.userId)
    return withCors({ statusCode: 200, body: JSON.stringify(result) })
  } catch (error) {
    console.error('editCaseHandler error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to edit case', message: error.message }) })
  }
}


// export const postCaseByUser = async (event) => {
//   const auth = requireAuth(event)
//   if (!auth.ok) return withCors(auth.response)

//   try {
//     const body = JSON.parse(event.body || '{}')
//     const result = await postCaseService(body)
//     return result
//   } catch (error) {
//     console.error('postCaseByUser error:', error)
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Failed to post case', message: error.message }),
//     }
//   }
// }

// POST /cases
export const createCase = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  try {
    const body = JSON.parse(event.body)
    body.userId = auth.user.userId
    const result = await createCaseService(body)
    return withCors({ statusCode: 201, body: JSON.stringify(result) })
  } catch (error) {
    console.error('createCase error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to create case', message: error.message }) })
  }
}

// GET /cases/hotspots
export const gethotspot = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  const roleError = requireRole(auth.user, 'admin')
  if (roleError) return withCors(roleError)

  try {
    const result = await HostspotService()
    return withCors({ statusCode: 200, body: JSON.stringify(result) })
  } catch (error) {
    console.error('gethotspot error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to get hotspot', message: error.message }) })
  }
}

// GET /cases/trends
export const getTrends = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  const roleError = requireRole(auth.user, 'admin')
  if (roleError) return withCors(roleError)

  try {
    const result = await trendAnalysisService()
    return withCors({ statusCode: 200, body: JSON.stringify(result) })
  } catch (error) {
    console.error('getTrends error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to get trends', message: error.message }) })
  }
}

// GET /cases/resolution
export const getResolution = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  const roleError = requireRole(auth.user, 'admin')
  if (roleError) return withCors(roleError)

  try {
    const result = await ResolutionTime()
    return withCors({ statusCode: 200, body: JSON.stringify(result) })
  } catch (error) {
    console.error('getResolution error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to get resolution', message: error.message }) })
  }
}

// GET /cases/monthly
export const getMonthlyReport = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  const roleError = requireRole(auth.user, 'admin')
  if (roleError) return withCors(roleError)

  try {
    const result = await monthlyReportService()
    return withCors({ statusCode: 200, body: JSON.stringify(result) })
  } catch (error) {
    console.error('getMonthlyReport error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to get monthly report', message: error.message }) })
  }
}

// DELETE /cases/all
export const deleteAllCases = async (event) => {
  const auth = requireAuth(event)
  if (!auth.ok) return withCors(auth.response)

  const roleError = requireRole(auth.user, 'admin')
  if (roleError) return withCors(roleError)

  try {
    const result = await deleteAllCasesService()
    return withCors({ statusCode: 200, body: JSON.stringify({ message: 'All cases deleted', ...result }) })
  } catch (error) {
    console.error('deleteAllCases error:', error)
    return withCors({ statusCode: 500, body: JSON.stringify({ error: 'Failed to delete all cases', message: error.message }) })
  }
}
