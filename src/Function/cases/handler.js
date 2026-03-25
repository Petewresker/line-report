// handler.js - validate แล้วเรียก service
// import { editCaseService, getCasesByUserService } from './service.js'
// export const editCaseHandler = async (event) => {
//   const { caseId } = event.pathParameters
//   const body = JSON.parse(event.body)
//   const result = await editCaseService(caseId, body) 
//   return { statusCode: 200, body: JSON.stringify(result) }
// }

// export const getCasesByUser = async (event) => {
//   const { userId } = event.queryStringParameters || {}
//   const result = await getCasesByUserService(userId)
//   return { statusCode: 200, body: JSON.stringify(result) }
// }

export const getCasesByUser = async (event)=>{
  const result = await getCasesByUserService(userId)
  return { statusCode: 200, body: JSON.stringify(result) }
}