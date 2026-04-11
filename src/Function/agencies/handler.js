// src/Function/agencies/handler.js
import { acceptCaseService } from './service.js'

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,userid,agencyid,role",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

function withCors(response) {
  return { ...response, headers: { ...CORS_HEADERS, ...(response.headers ?? {}) } };
}

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );
}

function getAuth(event) {
  const headers = normalizeHeaders(event.headers || {});
  return {
    userId: headers["userid"] || headers["user-id"],
    tokenAgencyId: headers["agencyid"] || headers["agency-id"],
    role: headers["role"]
  };
}

export const acceptCase = async (event) => {
  try {
    const { caseId } = event.pathParameters || {};
    const { userId } = getAuth(event);

    if (!caseId) {
      return withCors({ statusCode: 400, body: JSON.stringify({ message: "caseId is required" }) });
    }

    if (!userId) {
      return withCors({ statusCode: 400, body: JSON.stringify({ message: "userId is required" }) });
    }

    const result = await acceptCaseService(caseId, userId);

    if (!result.success) {
      return withCors({ statusCode: 400, body: JSON.stringify({ message: result.message }) });
    }

    return withCors({ statusCode: 200, body: JSON.stringify(result) });
  } catch (err) {
    console.error(err);
    return withCors({ statusCode: 500, body: JSON.stringify({ message: "Internal Server Error" }) });
  }
};
