// admin/index.js
import { assignReport, handleCreateAdmin, handleDeleteAdmin, handleGetMyAdmin } from './handler.js'
import jwt from 'jsonwebtoken'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
}

//Authenticate by using Helper function
/*คําอธิบาย 
  เราจะใช้ฟังก์ชันนี้เพื่อตรวว่าเข้าได้แนบ jwt มาหรือไม่
  แล้วถ้าแยกเขาได้เป็น role as required หรือไม่
  เราจะ pass parameter event เข้าไปเพื่อให้ฟังก์ชันนี้ตรวจสอบ header และ token ได้
  จากนั้นเมื่อนํา token มา verify แล้วเราจะตรวจสอบว่า role ที่ได้จาก token ตรงกับ requiredRole ที่เรากําหนดไว้หรือไม่
  หากไม่ตรงตามต้องการ เราจะส่ง response กลับไปว่า Forbidden และหาก token ไม่ถูกต้องหรือไม่มีเลย เราจะส่ง response ว่า Unauthorized
  หากทุกอย่างถูกต้อง เราจะ return null เพื่อให้ฟังก์ชันที่เรียกใช้สามารถดำเนินการต่อไปได้
*/
function requireRole(event, requiredRole) {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token){
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized: No token provided' }) };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== requiredRole) {
      return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Forbidden: Insufficient permissions' }) };
    }
  } catch (error) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized: Invalid token' }) };
  }
  return null; // No error, user has required role so pass!

}





export const handler = async (event) => {
  try {
    const { httpMethod, resource, pathParameters } = event

    // ===================================== GET ====================================
    if (httpMethod === 'GET' && resource === '/admin/me') { return handleGetMyAdmin(event) }

    // ===================================== POST ====================================
    if (httpMethod === 'POST' && resource === '/admin/users') { return handleCreateAdmin(event) }

    if (httpMethod === 'POST' && resource === '/admin/cases/{caseId}/assign') {
      const authError = requireRole(event, 'admin');
      if (authError) 
        return authError; 
      const { caseId } = pathParameters || {}
      return assignReport({ ...event, caseId })
    }

    // ไม่ได้ใช้จริง [เป็นซากอารยธรรมที่เราพยายามให้ agency แทน agencyId]
    // if (httpMethod === 'POST' && resource === '/admin/cases/{caseId}/agencies/{agencyId}') {
    //   const { caseId } = pathParameters || {}
    //   return assignReport({ ...event, caseId })
    // }

    // ===================================== DELETE ====================================
    if (httpMethod === 'DELETE' && resource === '/admin/users') { return handleDeleteAdmin(event) }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Not found', resource, httpMethod }),
    }
  } catch (error) {
    console.error('Unhandled error:', error)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    }
  }
}
