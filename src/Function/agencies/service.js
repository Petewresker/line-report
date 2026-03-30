import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { pushLine, createCompletionFlexMessage } from "./line.js";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  ...(process.env.DYNAMODB_ENDPOINT ? {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    credentials: { accessKeyId: "local", secretAccessKey: "local" }
  } : {})
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client({
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED"
});

const TABLE_NAME = process.env.TABLE_TABLE_NAME ?? "IncidentReports-local";

// สร้าง Presigned URL สำหรับอัปโหลดรูปภาพของ Agency
export async function getAgencyPresignedUrlService(filename, contentType) {
  const key = `agencies/${randomUUID()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
    Key: key,
    ContentType: contentType
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return { uploadUrl, key };
}

// ดึงเคสเดียวตาม agencyId + caseId
export async function getCaseById(_agencyId, caseId) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `CASE#${caseId}`,
        SK: "METADATA"
      }
    })
  );

  return result.Item;
}

// ดึงทุกเคสที่ assign ให้หน่วยงานนี้ (scan by AssignedAgencyName)
async function scanAll(params) {
  const items = [];
  let lastKey;
  do {
    const result = await dynamoDB.send(new ScanCommand({ ...params, ExclusiveStartKey: lastKey }));
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

export async function getCasesByAgencyId(agencyId) {
  const items = await scanAll({
    TableName: TABLE_NAME,
    FilterExpression: "AssignedAgencyID = :agencyId AND begins_with(PK, :prefix)",
    ExpressionAttributeValues: {
      ":agencyId": agencyId,
      ":prefix": "CASE#"
    }
  });

  // แนบ signed URL สำหรับรูปก่อนงาน
  return Promise.all(
    items.map(async (item) => {
      if (item.imageUrlBefore && !item.imageUrlBefore.startsWith("http")) {
        const cmd = new GetObjectCommand({
          Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
          Key: item.imageUrlBefore
        });
        item.imageUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
      } else {
        item.imageUrl = item.imageUrlBefore ?? null;
      }
      return item;
    })
  );
}


// ดึง Agency ทั้งหมด พร้อม imageUrl และ Status
export async function getAllAgenciesService() {
  const result = await dynamoDB.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "begins_with(PK, :prefix)",
      ExpressionAttributeValues: {
        ":prefix": "AGENCY#"
      }
    })
  );

  const items = result.Items || [];

  const itemsWithUrl = await Promise.all(
    items.map(async (item) => {
      if (item.ImageKey) {
        const command = new GetObjectCommand({
          Bucket: process.env.IMAGEBUCKET_BUCKET_NAME,
          Key: item.ImageKey
        });
        item.ImageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      }
      return item;
    })
  );

  return itemsWithUrl;
}

// ลบ Agency ทั้งหมด
export async function deleteAllAgenciesService() {
  const items = await scanAll({
    TableName: TABLE_NAME,
    FilterExpression: "begins_with(PK, :prefix)",
    ExpressionAttributeValues: { ":prefix": "AGENCY#" }
  });
  await Promise.all(
    items.map(item => dynamoDB.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: item.PK, SK: item.SK }
    })))
  );
  return { deleted: items.length };
}

// ลบ Agency (Reject)
export async function deleteAgencyService(agencyId) {
  await dynamoDB.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `AGENCY#${agencyId}`,
        SK: `METADATA#${agencyId}`
      }
    })
  );
}

// อนุมัติ Agency เปลี่ยน Status เป็น Active
export async function approveAgencyService(agencyId) {
  const result = await dynamoDB.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `AGENCY#${agencyId}`,
        SK: `METADATA#${agencyId}`
      },
      UpdateExpression: "SET #s = :active",
      ExpressionAttributeNames: { "#s": "Status" },
      ExpressionAttributeValues: { ":active": "ACTIVE" },
      ReturnValues: "ALL_NEW"
    })
  );
  return result.Attributes;
}

//Registration ให้ Agency
export async function registrationService(regisInformation) {
  const agencyId = randomUUID();
  const now = new Date().toISOString();

  const item = {
    PK: `AGENCY#${agencyId}`,
    SK: `METADATA#${agencyId}`,
    AgencyID: agencyId,
    UserID: regisInformation.userId,
    Name: regisInformation.name,
    Surname: regisInformation.surname,
    PhoneNumber: regisInformation.phoneNumber,
    AgencyName: regisInformation.agencyName,
    LineUserID: regisInformation.lineUserID,
    Email: regisInformation.email,
    Status: "PENDING_REVIEW",
    CreatedAt: now,
    ...(regisInformation.imageKey && { ImageKey: regisInformation.imageKey })
  };

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    })
  );

  return item;
}

// ดึง Agency จาก userId
export async function getAgencyByUserId(userId) {
  const result = await dynamoDB.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "UserID = :uid AND begins_with(PK, :prefix)",
      ExpressionAttributeValues: {
        ":uid": userId,
        ":prefix": "AGENCY#"
      }
    })
  );
  return result.Items?.[0] ?? null;
}

// รับงาน: เปลี่ยนสถานะเป็น IN_PROGRESS
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

  const matchByName = assignedByName && assignedByName === agencyItem.AgencyName
  const matchById   = assignedById   && assignedById   === agencyItem.AgencyID

  if (!matchByName && !matchById) {
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

// ปิดเคส: บันทึกรูปหลังทำงาน + summary + push LINE ไปหาผู้แจ้ง
export const completeCaseService = async (caseId, imageKeyAfter, summary) => {
  const result = await dynamoDB.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `CASE#${caseId}`, SK: "METADATA" },
    UpdateExpression: "SET #status = :status, ImageKeyAfter = :imageKeyAfter, Summary = :summary, CompletedAt = :completedAt",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: {
      ":status": "FINISHED",
      ":imageKeyAfter": imageKeyAfter,
      ":summary": summary,
      ":completedAt": new Date().toISOString()
    },
    ReturnValues: "ALL_NEW"
  }));

  const caseData = result.Attributes;

  // Push LINE ไปหาผู้แจ้ง
  const reporterLineId = caseData.userId || caseData.UserID;
  if (reporterLineId) {
    try {
      let imageAfterUrl = null;
      if (imageKeyAfter) {
        const cmd = new GetObjectCommand({ Bucket: process.env.IMAGEBUCKET_BUCKET_NAME, Key: imageKeyAfter });
        imageAfterUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
      }
      const msg = createCompletionFlexMessage(caseData, imageAfterUrl);
      await pushLine(reporterLineId, [msg]);
    } catch (err) {
      console.error("LINE push to reporter failed:", err);
    }
  }

  return caseData;
};
