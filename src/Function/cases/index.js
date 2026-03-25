import { getCasesByUser } from "./handler";

// cases/index.js
export const handler = async (event) => {
  console.log(JSON.stringify(event, undefined, 2));

  const method = event.httpMethod;
  const path = event.path;

  if (method === "GET" && path === "/cases") {
    return await getCasesByUser()
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Not Found" }),
  };
};