import {
  handleGetCaseById,
  handleGetCasesByAgencyId,
  handleRegistration,
  handleGetPresignUrl,
  handleGetAllAgencies,
  handleDeleteAgency,
  handleDeleteAllAgencies,
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
  try {
    const { httpMethod, resource } = event;

    if (httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    //==================================== GET ====================================
    if (httpMethod === "GET" && resource === "/agencies/me") { return await handleGetMyAgency(event);}
    if (httpMethod === "GET" && resource === "/agencies") { return await handleGetAllAgencies(event); }
    if (httpMethod === "GET" && resource === "/agencies/{agencyId}/cases/{caseId}") { return await handleGetCaseById(event);}
    //จริงๆแล้วต้องเป็น admin แต่ช่างมันก่อน ***ติดไว้
    if (httpMethod === "GET" && resource === "/agencies/{agencyId}/cases") { return await handleGetCasesByAgencyId(event); }

    //==================================== POST ====================================
    if (httpMethod === "POST" && resource === "/agencies") { return await handleRegistration(event); }
    if (httpMethod === "POST" && resource === "/agencies/presign") { return await handleGetPresignUrl(event);}
    if (httpMethod === "POST" && resource === "/agencies/cases/{caseId}/accept") { return await acceptCase(event); }
    if (httpMethod === "POST" && resource === "/agencies/cases/{caseId}/complete") { return await completeCaseHandler(event);}
    if (httpMethod === "POST" && resource === "/agencies/{agencyId}/approve") { return await handleApproveAgency(event);}

    //==================================== DELETE ====================================
    if (httpMethod === "DELETE" && resource === "/agencies/all") { return await handleDeleteAllAgencies(event); }
    if (httpMethod === "POST" && resource === "/agencies/{agencyId}/reject") { return await handleDeleteAgency(event);}

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Route not found" })
    };
  } catch (error) {
    console.error("Unhandled error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};
