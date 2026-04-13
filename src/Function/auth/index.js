import { login, verify } from './handler.js';

export const handler = async event => {
  console.log(JSON.stringify(event, undefined, 2));

  const path = event.path;
  const method = event.httpMethod;


  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
  };


  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  let response;


  if (path === '/auth/login' && method === 'POST') {
    response = await login(event);
  } else if (path === '/auth/verify' && method === 'GET') {
    response = await verify(event);
  } else {
    response = {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' })
    };
  }

  return {
    ...response,
    headers: {
      ...corsHeaders,
      ...response.headers
    }
  };
};
