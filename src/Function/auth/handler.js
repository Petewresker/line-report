import { verifyLineIdToken, findOrCreateUser } from './service.js';
import { create } from './issueJWT.js';
import { fromCookie, verify as verifyJWT } from './extractJWT.js';


export async function login(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { idToken } = body;

    if (!idToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'idToken is required',
          message: 'Please provide idToken in request body'
        })
      };
    }

    const lineProfile = await verifyLineIdToken(idToken);
    const lineUserId = lineProfile.sub;

    const user = await findOrCreateUser(lineUserId, lineProfile);

    const token = create(user);


    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `token=${token}; HttpOnly; Secure; SameSite=None; Max-Age=604800; Path=/`
      },
      body: JSON.stringify({
        success: true,
        token: token,
        user: {
          userId: user.userId,
          role: user.role,
          name: user.name,
          ...(user.agencyId && { agencyId: user.agencyId }),
          ...(user.adminId && { adminId: user.adminId })
        }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ 
        error: 'Authentication failed', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}



export async function verify(event) {
  try {
  
    const token = fromCookie(event.headers);

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'No token provided',
          message: 'Please provide token in Cookie header'
        })
      };
    }

 
    const decoded = verifyJWT(token);

    return {
      statusCode: 200,
      body: JSON.stringify({
        authenticated: true,
        user: {
          userId: decoded.userId,
          role: decoded.role,
          name: decoded.name,
          ...(decoded.agencyId && { agencyId: decoded.agencyId }),
          ...(decoded.adminId && { adminId: decoded.adminId })
        }
      })
    };
  } catch (error) {
    console.error('Verify error:', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ 
        error: 'Invalid or expired token',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}
