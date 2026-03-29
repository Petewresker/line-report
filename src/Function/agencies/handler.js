import {
  getCaseById,
  getCasesByAgencyId,
  registrationService,
  getAgencyPresignedUrlService,
  getAllAgenciesService,
  deleteAgencyService,
  approveAgencyService,
  acceptCaseService,
  completeCaseService,
  getAgencyByUserId
} from "./service.js";

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

export async function handleDeleteAgency(event) {
  const { agencyId } = event.pathParameters || {};
  if (!agencyId) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing agencyId" }) });
  }
  try {
    await deleteAgencyService(agencyId);
    return withCors({ statusCode: 200, body: JSON.stringify({ message: "Agency rejected and deleted" }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

export async function handleApproveAgency(event) {
  const { agencyId } = event.pathParameters || {};
  if (!agencyId) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing agencyId" }) });
  }
  try {
    const result = await approveAgencyService(agencyId);
    return withCors({ statusCode: 200, body: JSON.stringify({ message: "Agency approved", agency: result }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

export async function handleGetMyAgency(event) {
  const headers = normalizeHeaders(event.headers || {});
  const userId = headers["userid"] || headers["user-id"];

  if (!userId) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing userId" }) });
  }

  try {
    const agency = await getAgencyByUserId(userId);
    if (!agency) {
      return withCors({ statusCode: 404, body: JSON.stringify({ message: "Agency not found" }) });
    }
    return withCors({ statusCode: 200, body: JSON.stringify({ agencyId: agency.AgencyID, status: agency.Status }) });
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
  const { name, surname, phoneNumber, agencyName, lineUserID, email, imageKey } = body;

  if (!name || !surname || !phoneNumber || !agencyName) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing required fields: name, surname, phoneNumber, agencyName" }) });
  }

  try {
    const result = await registrationService({ userId, name, surname, phoneNumber, agencyName, lineUserID, email, imageKey });
    return withCors({ statusCode: 201, body: JSON.stringify({ message: "Registration submitted. Pending review.", agency: result }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// POST /agencies/cases/{caseId}/accept
export const acceptCase = async (event) => {
  try {
    const { caseId } = event.pathParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};
    const { userId } = body;

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

// POST /agencies/cases/{caseId}/complete
export const completeCaseHandler = async (event) => {
  try {
    const { caseId } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");
    const { imageKeyAfter, summary } = body;

    if (!caseId) {
      return withCors({ statusCode: 400, body: JSON.stringify({ message: "caseId is required" }) });
    }

    if (!imageKeyAfter || !summary) {
      return withCors({ statusCode: 400, body: JSON.stringify({ message: "imageKeyAfter and summary are required" }) });
    }

    const result = await completeCaseService(caseId, imageKeyAfter, summary);
    return withCors({ statusCode: 200, body: JSON.stringify({ message: "Case completed successfully", data: result }) });
  } catch (err) {
    console.error(err);
    return withCors({ statusCode: 500, body: JSON.stringify({ message: "Internal Server Error" }) });
  }
};
