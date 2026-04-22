import {
  getCaseById,
  getCasesByAgencyId,
  registrationService,
  getAgencyPresignedUrlService,
  getAllAgenciesService,
  deleteAgencyService,
  deleteAllAgenciesService,
  approveAgencyService,
  acceptCaseService,
  completeCaseService,
  getAgencyByUserId
} from "./service.js";

import { fromCookie, verify as verifyJWT } from './extractJWT.js';

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
// getAuth
// function (event) {
//   const headers = normalizeHeaders(event.headers || {});
//   return {
//     userId: headers["userid"] || headers["user-id"],
//     tokenAgencyId: headers["agencyid"] || headers["agency-id"],
//     role: headers["role"]
//   };
// }

function requireAuth(event = {}) {
  const token = fromCookie(event.headers);

  if (!token) {
    return {
      ok: false,
      response: {
        statusCode: 401,
        body: JSON.stringify({ message: "No token provided" })
      }
    };
  }

  try {
    const decoded = verifyJWT(token);

    return {
      ok: true,
      user: {
        userId: decoded.userId,
        role: decoded.role,
        agencyId: decoded.agencyId
      }
    };
  } catch (err) {
    return {
      ok: false,
      response: {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid or expired token" })
      }
    };
  }
}

function requireRole(user, allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "You do not have permission to access this resource",
        requiredRoles: roles,
        currentRole: user.role || null
      })
    };
  }
  return null;
}

// GET /agencies/{agencyId}/cases
export async function handleGetCasesByAgencyId(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const { agencyId } = event.pathParameters || {};

  const roleError = requireRole(auth.user, "agency");
  if (roleError) return withCors(roleError);
  
  if (auth.user.agencyId !== agencyId) {
    return withCors({
      statusCode: 403,
      body: JSON.stringify({ message: "Agency mismatch" })
    });
  }

  try {
    const items = await getCasesByAgencyId(agencyId);
    return withCors({ statusCode: 200, body: JSON.stringify(items) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// GET /agencies/{agencyId}/cases/{caseId}
export async function handleGetCaseById(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, "agency");
  if (roleError) return withCors(roleError);

  const { agencyId, caseId } = event.pathParameters || {};

  if (!agencyId || !caseId) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing agencyId or caseId" }) });
  }

  if (auth.user.agencyId !== agencyId) {
    return withCors({
      statusCode: 403,
      body: JSON.stringify({ message: "Agency mismatch" })
    });
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

// GET /agencies
export async function handleGetAllAgencies(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, ["admin", "agency"]);
  if (roleError) return withCors(roleError);
  try {
    const agencies = await getAllAgenciesService();
    return withCors({ statusCode: 200, body: JSON.stringify({ agencies }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// POST /agencies/presign
export async function handleGetPresignUrl(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, "agency");
  if (roleError) return withCors(roleError);

  const { filename, contentType } = JSON.parse(event.body || "{}");

  if (!filename || !contentType) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing filename or contentType" }) });
  }

  if(!filename.includes(".")) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Filename must include an extension (e.g., image.jpg)" }) });
  }

  const allowedExtensions = ["jpg", "jpeg", "png"];
  const fileExtension = filename.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return withCors({
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid file type. Only .jpg, .jpeg, .png are allowed"
      })
    });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(contentType)) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Invalid content type. Only JPEG and PNG are allowed." }) });
  }

  try {
    const result = await getAgencyPresignedUrlService(filename, contentType);
    return withCors({ statusCode: 200, body: JSON.stringify(result) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// DELETE /agencies/all
export async function handleDeleteAllAgencies(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, "admin");
  if (roleError) return withCors(roleError);

  try {
    const result = await deleteAllAgenciesService();
    return withCors({ statusCode: 200, body: JSON.stringify(result) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// DELETE /agencies/{agencyId}/reject
export async function handleDeleteAgency(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, "admin");
  if (roleError) return withCors(roleError);
  
  const { agencyId } = event.pathParameters || {};
  if (!agencyId) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing agencyId" }) });
  }
  try {
    const result = await deleteAgencyService(agencyId);
    if (!result) {
      return withCors({ statusCode: 404, body: JSON.stringify({ message: "Agency not found" }) });
    }
    return withCors({ statusCode: 200, body: JSON.stringify({ message: "Agency rejected and deleted" }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// POST /agencies/{agencyId}/approve
export async function handleApproveAgency(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, "admin");
  if (roleError) return withCors(roleError);

  const { agencyId } = event.pathParameters || {};

  if (!agencyId) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Missing agencyId" }) });
  }
  try {
    const result = await approveAgencyService(agencyId);
    if (!result) {
      return withCors({ statusCode: 404, body: JSON.stringify({ message: "Agency not found" }) });
    }
    return withCors({ statusCode: 200, body: JSON.stringify({ message: "Agency approved", agency: result }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// GET /agencies/me
export async function handleGetMyAgency(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  try {
    const agency = await getAgencyByUserId(auth.user.userId);
    if (!agency) {
      return withCors({ statusCode: 404, body: JSON.stringify({ message: "Agency not found" }) });
    }
    return withCors({
      statusCode: 200,
      body: JSON.stringify({
        agencyId: agency.AgencyID,
        status: agency.Status,
        role: auth.user.role
      })
    });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// POST /agencies
export async function handleRegistration(event) {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, ["admin","user"]);
  if (roleError) return withCors(roleError);

  const body = JSON.parse(event.body) || "{}";
  const { name, surname, phoneNumber, agencyName, lineUserID, email, imageKey } = body;

  const requiredFields = { name, surname, phoneNumber, agencyName, lineUserID, email, imageKey };

  // Check for missing required fields
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value || value.toString().trim() === "")
    .map(([key, _]) => key);

  if (missingFields.length > 0) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: `Missing required fields: ${missingFields.join(", ")}` }) });
  }

  //Check phone number format
  if (body.phoneNumber && !/^[0-9]{9,10}$/.test(body.phoneNumber)) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Invalid phone number. Please enter a valid Thai phone number (e.g., 0XXXXXXXXX)" }) });
  }

  //Check email format
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return withCors({ statusCode: 400, body: JSON.stringify({ message: "Invalid email format. Please enter a valid email address (e.g., example@example.com)" }) });
  }

  try {
    const result = await registrationService({ userId: auth.user.userId, name, surname, phoneNumber, agencyName, lineUserID, email, imageKey });
    return withCors({ statusCode: 201, body: JSON.stringify({ message: "Registration submitted. Pending review.", agency: result }) });
  } catch (error) {
    return withCors({ statusCode: 500, body: JSON.stringify({ message: error.message }) });
  }
}

// POST /agencies/cases/{caseId}/accept
export const acceptCase = async (event) => {
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, "agency");
  if (roleError) return withCors(roleError);
  
  try {
    const { caseId } = event.pathParameters || {};

    if (!caseId) {
      return withCors({ statusCode: 400, body: JSON.stringify({ message: "caseId is required" }) });
    }

    const result = await acceptCaseService(caseId, auth.user.userId);

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
  const auth = requireAuth(event);
  if (!auth.ok) return withCors(auth.response);

  const roleError = requireRole(auth.user, "agency");
  if (roleError) return withCors(roleError);
  
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

    const allowedExtensions = ["jpg", "jpeg", "png"];
    if (imageKeyAfter) {
      const ext = imageKeyAfter.split(".").pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return withCors({
          statusCode: 400,
          body: JSON.stringify({
            message: "Invalid image format. Only .jpg, .jpeg, .png are allowed"
          })
        });
      }
    }
    const result = await completeCaseService(caseId, imageKeyAfter, summary);
    return withCors({ statusCode: 200, body: JSON.stringify({ message: "Case completed successfully", data: result }) });
  } catch (err) {
    console.error(err);
    return withCors({ statusCode: 500, body: JSON.stringify({ message: "Internal Server Error" }) });
  }
};
