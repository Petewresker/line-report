// admin/index.js
import { assignReport } from './handler.js';

export const handler = async (event) => {
  const { httpMethod, resource, pathParameters } = event;

  if (
    httpMethod === 'POST' &&
    resource === '/admin/cases/{caseId}/agencies/{agencyId}'
  ) {
    const { caseId, agencyId } = pathParameters || {};

    return assignReport({
      ...event,
      caseId,
      agencyId
    });
  }

  return { statusCode: 404, body: 'Not found' };
};