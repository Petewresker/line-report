import { assignReportService, createAdminService, deleteAdminService, getAdminByUserIdService } from "./service.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

const internalError = () => {
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Internal Server Error" })
  };
};

// POST /admin/users
export const handleCreateAdmin = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {})
    const { lineUserId, name } = body

    if (!lineUserId || !name) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: "lineUserId and name are required" }) }
    }

    const existing = await getAdminByUserIdService(lineUserId)
    if (existing) {
      return { statusCode: 409, headers: CORS_HEADERS, body: JSON.stringify({ message: "Admin already exists", admin: existing }) }
    }

    const admin = await createAdminService(lineUserId, name)
    return { statusCode: 201, headers: CORS_HEADERS, body: JSON.stringify({ message: "Admin created", admin }) }
  } catch (error) {
    console.error("handleCreateAdmin error:", error)
    return internalError()
  }
}

// DELETE /admin/users
export const handleDeleteAdmin = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {})
    const { lineUserId } = body

    if (!lineUserId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: "lineUserId is required" }) }
    }

    const deleted = await deleteAdminService(lineUserId)
    if (!deleted) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Admin not found" }) }
    }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: "Admin deleted" }) }
  } catch (error) {
    console.error("handleDeleteAdmin error:", error)
    return internalError()
  }
}

// GET /admin/me
export const handleGetMyAdmin = async (event) => {
  try {
    const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]))
    const lineUserId = headers["userid"]

    if (!lineUserId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: "userid header is required" }) }
    }

    const admin = await getAdminByUserIdService(lineUserId)
    if (!admin) {
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not an admin" }) }
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ admin }) }
  } catch (error) {
    console.error("handleGetMyAdmin error:", error)
    return internalError()
  }
}

// POST /admin/cases/{caseId}/assign
// POST /admin/cases/{caseId}/agencies/{agencyId}
export const assignReport = async (event) => {
  try {
    const { caseId } = event;
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {})
    const caseIds = Array.isArray(body.caseIds) ? body.caseIds : []
    const agencyId = body.agencyId

    if (!agencyId) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'agencyId is required' }) }
    }

    const result = await assignReportService(caseId, agencyId, caseIds);

    return {
      statusCode: result.statusCode || 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result.data)
    };

  } catch (error) {
    console.error("assignReport error:", error);
    return internalError();
  }
};