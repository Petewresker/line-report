import jwt from 'jsonwebtoken';


export function create(user) {
  const payload = {
    userId: user.userId,
    role: user.role,
    name: user.name
  };
  
  
  if (user.agencyId) {
    payload.agencyId = user.agencyId;
  }
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return token;
}
