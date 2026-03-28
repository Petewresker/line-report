import { getCaseById, getCasesByAgencyId } from "./service.js";

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

// ของเก่า: ดูทุกเคสของ agency
export async function handleGetCasesByAgencyId(event) {
  const { agencyId } = event.pathParameters || {};
  const { userId, tokenAgencyId, role } = getAuth(event);

  if (!userId || !agencyId || !role) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing authentication data" })
    };
  }

  if (role !== "agency") {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Unauthorized" })
    };
  }

  if (tokenAgencyId !== agencyId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Agency mismatch" })
    };
  }

  try {
    const items = await getCasesByAgencyId(agencyId);

    return {
      statusCode: 200,
      body: JSON.stringify(items)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
}

// ของใหม่: ดูเคสเดียวตาม caseId
export async function handleGetCaseById(event) {
  const { agencyId, caseId } = event.pathParameters || {};
  const { userId, tokenAgencyId, role } = getAuth(event);

  if (!userId || !agencyId || !caseId || !role) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing authentication data" })
    };
  }

  if (role !== "agency") {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Unauthorized" })
    };
  }

  if (tokenAgencyId !== agencyId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Agency mismatch" })
    };
  }

  try {
    const item = await getCaseById(agencyId, caseId);

    if (!item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Case not found" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(item)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
}
