// handler.js
import { editCaseService, getCasesByUserService, getAllCasesService, postCaseService } from './service.js'

export const editCaseHandler = async (event) => {
  try {
    const { caseId } = event.pathParameters
    const body = JSON.parse(event.body)
    const result = await editCaseService(caseId, body)
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (error) {
    console.error('editCaseHandler error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to edit case', message: error.message }),
    }
  }
}

export const getCasesByUser = async (event) => {
  try {
    const { userId } = event.queryStringParameters || {}
    const result = userId
      ? await getCasesByUserService(userId)
      : await getAllCasesService()
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (error) {
    console.error('getCasesByUser error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get cases', message: error.message }),
    }
  }
}

export const postCaseByUser = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const result = await postCaseService(body)
    return result
  } catch (error) {
    console.error('postCaseByUser error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to post case', message: error.message }),
    }
  }
}