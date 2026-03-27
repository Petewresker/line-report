// cases/index.js
import { getCasesByUser, editCaseHandler, postCaseByUser } from './handler.js'

export const handler = async (event) => {
  try {
    const { httpMethod, path } = event

    //วิธีเขียน PATH
    if (httpMethod === 'GET' && path === '/cases')       return getCasesByUser(event)
    if (httpMethod === 'POST' && path.includes('/edit')) return editCaseHandler(event)
    if (httpMethod === 'POST' && path === '/cases')      return await postCaseByUser(event)

    //ถ้าทีมมาทําให้ comment เส้นเราไปนะเพราะว่าเราลอง Test ดูเฉยๆพอดีไม่ได้ test local เรายังไม่มี วิเคราะห์ case ซํ้า
    //กําลังคิดอยู่ว่าถ้ามีแบบนี้ UX อาจจะไม่ดีหรือป่าว :P

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