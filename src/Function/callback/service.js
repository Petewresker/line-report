// TODO: uncomment เมื่อต่อ DynamoDB จริง
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
// const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Mock data — ใช้ก่อนที่ DynamoDB จะมีข้อมูลจริง
const MOCK_CASES = [
  {
    caseId: "CASE001",
    userId: "LINE123456",
    description: "ถนนแตกร้าวบริเวณหน้าอาคาร SC3 เป็นหลุมขนาดใหญ่กีดขวางทางสัญจร",
    location: "อาคาร SC3",
    topic: "ถนน",
    status: "in_progress",
    imageUrl: "https://fastly.picsum.photos/id/74/100/100.jpg?hmac=hdHqMndTN7L5F180xg_cfJX8psrMoGWl1gbqAwfIAAU",
    createdAt: "2026-03-20T10:30:00",
  },
  {
    caseId: "CASE002",
    userId: "LINE123456",
    description: "ไฟฟ้าดับบริเวณลานจอดรถอาคาร A ตั้งแต่เมื่อคืน",
    location: "ลานจอดรถ อาคาร A",
    topic: "ไฟฟ้า",
    status: "pending",
    imageUrl: "https://fastly.picsum.photos/id/10/100/100.jpg?hmac=yfRDzOq2hXVqS7RPFN8y9wuRr14FXGK9gJa4HQsxtI",
    createdAt: "2026-03-21T08:00:00",
  },
];

// eslint-disable-next-line no-unused-vars
export async function getCasesByUserId(_userId) {
  // TODO: เปลี่ยนเป็น query จริงเมื่อมี DynamoDB
  // const result = await client.send(new QueryCommand({
  //   TableName: process.env.TABLE_TABLE_NAME,
  //   IndexName: "GSI_3_User_History",
  //   KeyConditionExpression: "ReporterID = :uid",
  //   ExpressionAttributeValues: { ":uid": userId },
  //   ScanIndexForward: false,
  //   Limit: 5,
  // }));
  // return result.Items;

  return MOCK_CASES;
}
