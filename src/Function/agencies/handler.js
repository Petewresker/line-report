import { getCaseById, getCasesByAgencyId, registrationService, getAgencyPresignedUrlService, getAllAgenciesService } from "./service.js";

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

// ของเก่า: ดูทุกเคสของ agency
export async function handleGetCasesByAgencyId(event) {
  const { agencyId } = event.pathParameters || {};
  const { userId, tokenAgencyId, role } = getAuth(event);

  if (!userId || !agencyId || !role) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing authentication data" }) });
  }

  if (role !== "agency") {
    return withCors({ statusCode: 403, body: JSON.stringify({ message: "Unauthorized" }) });
  }

  if (tokenAgencyId !== agencyId) {
    return withCors({ statusCode: 403, body: JSON.stringify({ message: "Agency mismatch" }) });
  }

  try {
    const items = await getCasesByAgencyId(agencyId);
    return withCors({ statusCode: 200, body: JSON.stringify(items) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// ของใหม่: ดูเคสเดียวตาม caseId
export async function handleGetCaseById(event) {
  const { agencyId, caseId } = event.pathParameters || {};
  const { userId, tokenAgencyId, role } = getAuth(event);

  if (!userId || !agencyId || !caseId || !role) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing authentication data" }) });
  }

  if (role !== "agency") {
    return withCors({ statusCode: 403, body: JSON.stringify({ message: "Unauthorized" }) });
  }

  if (tokenAgencyId !== agencyId) {
    return withCors({ statusCode: 403, body: JSON.stringify({ message: "Agency mismatch" }) });
  }

  try {
    const item = await getCaseById(agencyId, caseId);

    if (!item) {
      return withCors({ statusCode: 404, body: JSON.stringify({ message: "Case not found" }) });
    }

    return withCors({ statusCode: 200, body: JSON.stringify(item) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

export async function handleGetAllAgencies() {
  try {
    const agencies = await getAllAgenciesService();
    return withCors({ statusCode: 200, body: JSON.stringify({ agencies }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

export async function handleGetPresignUrl(event) {
  const { filename, contentType } = JSON.parse(event.body || "{}");

  if (!filename || !contentType) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing filename or contentType" }) });
  }

  try {
    const result = await getAgencyPresignedUrlService(filename, contentType);
    return withCors({ statusCode: 200, body: JSON.stringify(result) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

export async function handleRegistration(event) {
  const headers = normalizeHeaders(event.headers || {});
  const userId = headers["userid"] || headers["user-id"];

  if (!userId) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing authentication data" }) });
  }

  const body = JSON.parse(event.body);
  const { name, surname, phoneNumber, agencyName, lineUserID, email } = body;

  if (!name || !surname || !phoneNumber || !agencyName) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing required fields: name, surname, phoneNumber, agencyName" }) });
  }

  try {
    const result = await registrationService({ userId, name, surname, phoneNumber, agencyName, lineUserID, email });
    return withCors({ statusCode: 201, body: JSON.stringify({ message: "Registration submitted. Pending review.", agency: result }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}
