import { handleGetCaseById, handleGetCasesByAgencyId, handleRegistration, handleGetPresignUrl, handleGetAllAgencies } from "./handler.js";

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

  if (httpMethod === "GET" && resource === "/agencies") {
    return await handleGetAllAgencies();
  }

  if (httpMethod === 'POST' && resource ==="/agencies"){
    return await handleRegistration(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Route not found" })
  };
};
