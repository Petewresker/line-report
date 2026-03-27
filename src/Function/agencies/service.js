// src/Function/agencies/service.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export const acceptCaseService = async (caseId, userId) => {
    const TableName = process.env.TABLE_TABLE_NAME

    const PK = `REPORT#${caseId}`
    const SK = `METADATA#${caseId}`

    //หา case
    const { Item } = await docClient.send(new GetCommand({
    TableName,
    Key: { PK, SK }
    }))

    if (!Item) {
        return {
            success: false,
            message: "Case not found"
        }
    }

    //หา agency จาก userId
    const agencyRes = await docClient.send(new ScanCommand({
        TableName,
        FilterExpression: "UserID = :uid",
        ExpressionAttributeValues: {
            ":uid": userId
        }
    }))

    const agencyItem = agencyRes.Items?.[0]

    if (!agencyItem) {
        return { success: false, message: "Agency not found for this user" }
    }

    const agencyId = agencyItem.PK

    //เช็คว่าเคสถูก assign ไหม   
    if (!Item.AssignedAgencyID) {
        return {
            success: false,
            message: "This case has not been assigned to any agency"
        }
    }

    //เช็คว่าเป็น agency ที่ถูก assign ไหม
    if (Item.AssignedAgencyID !== agencyId) {
    return {
        success: false,
        message: "You are not assigned to this case"
        }
    }

    //ต้องเป็น FORWARDED ก่อนถึงรับได้
    if (Item.Status !== "FORWARDED") {
        return {
            success: false,
            message: "Case must be FORWARDED before accepting"
        }
    }

    //update
    await docClient.send(new UpdateCommand({
        TableName,
        Key: { PK, SK },
        UpdateExpression: `
            SET #status = :status,
                AcceptedAt = :now
        `,
        ExpressionAttributeNames: {
            "#status": "Status"
        },
        ExpressionAttributeValues: {
            ":status": "IN_PROGRESS",
            ":now": new Date().toISOString()
        }
    }))

    return {
        message: "Case accepted successfully",
        status: "IN_PROGRESS"
    }
}