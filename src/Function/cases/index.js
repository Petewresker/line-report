// cases/index.js
import { getCasesByUser, editCaseHandler, createCase, postCaseByUser, getPresignedUrl, gethotspot, getTrends, getResolution ,deleteCase} from './handler.js'

export const handler = async (event) => {
  try {
    const { httpMethod, path } = event

    //วิธีเขียน PATH
    if (httpMethod === 'GET' && path === '/cases/presigned-url') return getPresignedUrl(event)
    if (httpMethod === 'GET' && path === '/cases')       return getCasesByUser(event)
    if (httpMethod === 'POST' && path.includes('/edit')) return editCaseHandler(event)
    //if (httpMethod === 'POST' && path === '/cases')      return await postCaseByUser(event)
    if (httpMethod === 'POST' && path === '/cases') return createCase(event)
    if (httpMethod === 'GET' && path === '/cases/hotspots') return gethotspot()
    if (httpMethod === 'GET' && path === '/cases/trends') return getTrends()
    if (httpMethod === 'GET' && path === '/cases/resolution') return getResolution()
    //For Unit testing
    if (httpMethod === 'DELETE' && path === '/cases') return deleteCase(event)


    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found', path, httpMethod }),
    }
  } catch (error) {
    console.error('Unhandled error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      }),
    }
  }
}