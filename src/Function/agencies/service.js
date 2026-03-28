import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({
  region: "ap-southeast-1",
  endpoint: "http://host.docker.internal:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client({
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED"
});

const TABLE_NAME = "IncidentReports-local";

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
export async function getCaseById(agencyId, caseId) {
  const result = await dynamoDB.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: agencyId,
        SK: caseId
      }
    })
  );

  return result.Item;
}

// ดึงทุกเคสของ agency เดียวกัน
export async function getCasesByAgencyId(agencyId) {
  const result = await dynamoDB.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :agencyId",
      ExpressionAttributeValues: {
        ":agencyId": agencyId
      }
    })
  );

  return result.Items || [];
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
    CreatedAt: now
  };

  await dynamoDB.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    })
  );

  return item;
}