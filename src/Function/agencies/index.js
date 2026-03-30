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
    const { httpMethod, path } = event;

    if (httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    if (httpMethod === "GET" && path === "/agencies/me") {
      return await handleGetMyAgency(event);
    }

    if (httpMethod === "GET" && path === "/agencies") {
      return await handleGetAllAgencies();
    }

    if (httpMethod === "POST" && path === "/agencies") {
      return await handleRegistration(event);
    }

    if (httpMethod === "POST" && path === "/agencies/presign") {
      return await handleGetPresignUrl(event);
    }

    if (httpMethod === "POST" && path.match(/^\/agencies\/cases\/[^/]+\/accept$/)) {
      return await acceptCase(event);
    }

    if (httpMethod === "POST" && path.match(/^\/agencies\/cases\/[^/]+\/complete$/)) {
      return await completeCaseHandler(event);
    }

    if (httpMethod === "GET" && path.match(/^\/agencies\/[^/]+\/cases\/[^/]+$/)) {
      return await handleGetCaseById(event);
    }

    //จริงๆแล้วต้องเป็น admin แต่ช่างมันก่อน ***ติดไว้
    if (httpMethod === "GET" && path.match(/^\/agencies\/[^/]+\/cases$/)) {
      return await handleGetCasesByAgencyId(event);
    }

    if (httpMethod === "POST" && path.match(/^\/agencies\/[^/]+\/approve$/)) {
      return await handleApproveAgency(event);
    }

    if (httpMethod === "DELETE" && path === "/agencies/all") {
      return await handleDeleteAllAgencies();
    }

    if (httpMethod === "DELETE" && path.match(/^\/agencies\/[^/]+$/)) {
      return await handleDeleteAgency(event);
    }

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
