import { handleGetCaseById, handleGetCasesByAgencyId, handleRegistration, handleGetPresignUrl, handleGetAllAgencies } from "./handler.js";

export const handler = async (event) => {
  const { httpMethod, resource } = event;

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
