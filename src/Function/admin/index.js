// admin/index.js
import { assignReport, handleCreateAdmin, handleDeleteAdmin, handleGetMyAdmin } from './handler.js'
import jwt from 'jsonwebtoken'
import { fromHeader ,verify as JWTverify} from './extractJWT.js'

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
  const token = fromHeader(event);
  console.log("token : ",token); //For Debugger via cloudwatch

  if (!token){
    console.log('No token provided in Authorization header'); 
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized: No token provided' }) };
  }

  try {
    const decoded = JWTverify(token);
    console.log("Decode : ",decoded);
    if(decoded.role != requiredRole){
      console.log("Decode role : ",decoded.role);
      return { statusCode:401 , headers:CORS_HEADERS, body: JSON.stringify({UnAuthorized :"role not compatible as required"})};
    }  
  } catch (error) {
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Unauthorized: Invalid token' }) };
  }
  return null;

}





export const handler = async (event) => {
  try {
    const { httpMethod, resource, pathParameters } = event


    // ===================================== POST ====================================
    if (httpMethod === 'POST' && resource === '/admin/users') { 
      
        const authError = requireRole(event, 'admin');
        if(authError) return authError;
      
        return handleCreateAdmin(event) }

    if (httpMethod === 'POST' && resource === '/admin/cases/{caseId}/assign') {
      const authError = requireRole(event, 'admin');
      if (authError) 
        return authError; 
      const { caseId } = pathParameters || {}
      return assignReport({ ...event, caseId })
    }

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
