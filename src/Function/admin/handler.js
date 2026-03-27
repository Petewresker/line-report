import { assignReportService } from "./service.js";

const internalError = () => {
  return {
    statusCode: 500,
    body: JSON.stringify({ message: "Internal Server Error" })
  };
};

export const assignReport = async (event) => {
  try {
    const { caseId, agencyId } = event;

    const result = await assignReportService(caseId, agencyId);

    return {
      statusCode: result.statusCode || 200,
      body: JSON.stringify(result.data)
    };

  } catch (error) {
    console.error("assignReport error:", error);
    return internalError();
  }
};