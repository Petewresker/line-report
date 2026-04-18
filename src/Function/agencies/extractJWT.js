import cookie from 'cookie';
import jwt from 'jsonwebtoken';


export function fromCookie(headers = {}) {

  const cookieHeader = headers.Cookie || headers.cookie || '';
  if (cookieHeader) {
    const cookies = cookie.parse(cookieHeader);
    if (cookies.token) {
      return cookies.token;
    }
  }
  
  const authHeader = headers.Authorization || headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}


export function verify(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}
