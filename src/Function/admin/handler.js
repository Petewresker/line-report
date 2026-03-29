import { assignReportService, createAdminService, getAdminByUserIdService } from "./service.js";

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

export const assignReport = async (event) => {
  try {
    const { caseId } = event;
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {})
    const caseIds = Array.isArray(body.caseIds) ? body.caseIds : []
    const agencyName = body.agencyName

    if (!agencyName) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'agencyName is required' }) }
    }

    const result = await assignReportService(caseId, agencyName, caseIds);

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