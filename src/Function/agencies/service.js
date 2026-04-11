// src/Function/agencies/service.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  ...(process.env.DYNAMODB_ENDPOINT ? {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    credentials: { accessKeyId: "local", secretAccessKey: "local" }
  } : {})
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_TABLE_NAME ?? "IncidentReports-local";

export const acceptCaseService = async (caseId, userId) => {
    const PK = `CASE#${caseId}`;
    const SK = "METADATA";

    const { Item } = await dynamoDB.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK, SK }
    }));

    if (!Item) {
        return { success: false, message: "Case not found" };
    }

    // หา agency จาก userId
    const agencyRes = await dynamoDB.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "UserID = :uid AND begins_with(PK, :prefix)",
        ExpressionAttributeValues: {
        ":uid": userId,
        ":prefix": "AGENCY#"
        }
    }));

    const agencyItem = agencyRes.Items?.[0];
    if (!agencyItem) {
        return { success: false, message: "Agency not found for this user" };
    }

    const assignedByName = Item.AssignedAgencyName
    const assignedById   = Item.AssignedAgencyID

    if (!assignedByName && !assignedById) {
        return { success: false, message: "This case has not been assigned to any agency" };
    }

    if (assignedById !== agencyItem.AgencyID) {
        return { success: false, message: "Your agency is not assigned to this case" };
    }

    if (Item.status !== "FORWARD") {
        return { success: false, message: "Case must be FORWARD before accepting" };
    }

    await dynamoDB.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK, SK },
        UpdateExpression: "SET #status = :status, AssignedAgencyID = :agencyId, AcceptedAt = :now",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
        ":status": "IN_PROGRESS",
        ":agencyId": agencyItem.AgencyID,  // บันทึกว่าใครในกลุ่มเป็นคนรับ
        ":now": new Date().toISOString()
        }
    }));

    return { success: true, message: "Case accepted successfully", status: "IN_PROGRESS" };
};