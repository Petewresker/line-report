import { handleGetCaseById, handleGetCasesByAgencyId } from "./handler.js";

export const handler = async (event) => {
  const { httpMethod, resource } = event;

  if (httpMethod === "GET" && resource === "/agencies/{agencyId}/cases") {
    return await handleGetCasesByAgencyId(event);
  }

  if (httpMethod === "GET" && resource === "/agencies/{agencyId}/cases/{caseId}") {
    return await handleGetCaseById(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Route not found" })
  };
};
