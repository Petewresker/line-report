import { assignReportService } from "./service.js";

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

export const assignReport = async (event) => {
  try {
    const { caseId, agencyId } = event;
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {})
    const caseIds = Array.isArray(body.caseIds) ? body.caseIds : []

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