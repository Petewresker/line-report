// agencies/index.js
import { acceptCase } from './handler.js'

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,userid,agencyid,role",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

export const handler = async (event) => {
  try {
    const { httpMethod, resource, pathParameters } = event
      if (httpMethod === "OPTIONS") { return { statusCode: 200, headers: CORS_HEADERS, body: "" };}
      if (httpMethod === 'POST' && resource === '/agencies/cases/{caseId}/accept'){ return acceptCase(event)}

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
}