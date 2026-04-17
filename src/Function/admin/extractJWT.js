import jwt from 'jsonwebtoken';


export function fromHeader(event) {
  
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
  
}


export function verify(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}
