// src/Function/agencies/handler.js
import { acceptCaseService } from './service.js'

export const acceptCase = async (event) => {
  try {
    const { caseId } = event

    const body = event.body ? JSON.parse(event.body) : {}
    const { userId } = body

    //Check ว่ามี userID ไหม
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "userId is required" })
      }
    }

    const result = await acceptCaseService(caseId, userId)
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }

  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    }
  }
}