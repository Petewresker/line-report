import {
  handleGetCaseById,
  handleGetCasesByAgencyId,
  handleRegistration,
  handleGetPresignUrl,
  handleGetAllAgencies,
  handleDeleteAgency,
  handleApproveAgency,
  acceptCase,
  completeCaseHandler,
  handleGetMyAgency
} from "./handler.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,userid,agencyid,role",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

export const handler = async (event) => {
  const { httpMethod, resource } = event;

  if (httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  if (httpMethod === "GET" && resource === "/agencies/{agencyId}/cases") {
    return await handleGetCasesByAgencyId(event);
  }

  if (httpMethod === "GET" && resource === "/agencies/{agencyId}/cases/{caseId}") {
    return await handleGetCaseById(event);
  }

  if (httpMethod === "POST" && resource === "/agencies/presign") {
    return await handleGetPresignUrl(event);
  }

  if (httpMethod === "GET" && resource === "/agencies/me") {
    return await handleGetMyAgency(event);
  }

  if (httpMethod === "GET" && resource === "/agencies") {
    return await handleGetAllAgencies();
  }

  if (httpMethod === "POST" && resource === "/agencies") {
    return await handleRegistration(event);
  }

  if (httpMethod === "DELETE" && resource === "/agencies/{agencyId}") {
    return await handleDeleteAgency(event);
  }

  if (httpMethod === "POST" && resource === "/agencies/{agencyId}/approve") {
    return await handleApproveAgency(event);
  }

  if (httpMethod === "POST" && resource === "/agencies/cases/{caseId}/accept") {
    return await acceptCase(event);
  }

  if (httpMethod === "POST" && resource === "/agencies/cases/{caseId}/complete") {
    return await completeCaseHandler(event);
  }

  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Route not found" })
  };
};
