import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'

const users = [
  {
    "PK": "USER#U001",
    "SK": "METADATA#U001",
    "DisplaynName": "สมชาย รักเมือง",
    "Role": "Citizen",
    "ProfileImageURL": "https://s3-mock.com/profiles/u001.jpg"
  },
  {
    "PK": "USER#U002",
    "SK": "METADATA#U002",
    "DisplaynName": "สมหญิง แจ้งเหตุ",
    "Role": "Citizen",
    "ProfileImageURL": "https://s3-mock.com/profiles/u002.jpg"
  }
];

const agencies = [
  {
    "PK": "AGENCY#A001",
    "SK": "METADATA#A001",
    "UserID": "AG_U001",
    "AgencyName": "หน่วยงานการประปา",
    "LineUserID": "U11111111111111111111",
    "Email": "water@mockcity.go.th",
    "ContactPerson": "นายช่าง น้ำใส"
  },
  {
    "PK": "AGENCY#A002",
    "SK": "METADATA#A002",
    "UserID": "AG_U002",
    "AgencyName": "หน่วยงานการไฟฟ้านครหลวง",
    "LineUserID": "U22222222222222222222",
    "Email": "power@mockcity.go.th",
    "ContactPerson": "นายช่าง สว่าง"
  },
  {
    "PK": "AGENCY#A003",
    "SK": "METADATA#A003",
    "UserID": "AG_U003",
    "AgencyName": "สำนักการโยธา",
    "LineUserID": "U33333333333333333333",
    "Email": "civil@mockcity.go.th",
    "ContactPerson": "นายช่าง ถนนดี"
  }
];

const reports = [
  {
    "PK": "REPORT#R001",
    "SK": "METADATA#R001",
    "ReporterID": "U001",
    "Title": "ท่อประปาแตก น้ำท่วมขัง",
    "Description": "ท่อแตกหน้าปากซอย น้ำไหลนองเต็มถนน ทำให้รถสัญจรลำบากมาก",
    "Status": "PENDING",
    "PhotoURL_Before": "https://s3-mock.com/reports/r001_before.jpg",
    "PhotoURL_After": "",
    "Lat": 13.7563,
    "Lng": 100.5018,
    "AI_Suggested_Category": "Water/Plumbing",
    "AI_Confidence": 0.95,
    "AssignedAgencyID": "",
    "CreatedAt": "2026-03-25T08:30:00Z",
    "AcceptedAt": "",
    "ResolvedAt": "",
    "Summary": "",
    "GSI1_PK": "",
    "GSI1_SK": "",
    "GSI3_PK": "U001",
    "GSI3_SK": "2026-03-25T08:30:00Z"
  },
  {
    "PK": "REPORT#R002",
    "SK": "METADATA#R002",
    "ReporterID": "U002",
    "Title": "เสาไฟฟ้าเอียง เสี่ยงล้ม",
    "Description": "เสาไฟฟ้าเอนเอียงเข้ามาทางบ้านเรือน สายไฟหย่อนลงมาต่ำมาก",
    "Status": "FORWARDED",
    "PhotoURL_Before": "https://s3-mock.com/reports/r002_before.jpg",
    "PhotoURL_After": "",
    "Lat": 13.7451,
    "Lng": 100.5346,
    "AI_Suggested_Category": "Electricity",
    "AI_Confidence": 0.98,
    "AssignedAgencyID": "",
    "CreatedAt": "2026-03-25T10:15:00Z",
    "AcceptedAt": "",
    "ResolvedAt": "",
    "Summary": "",
    "GSI1_PK": "",
    "GSI1_SK": "",
    "GSI3_PK": "U002",
    "GSI3_SK": "2026-03-25T10:15:00Z"
  }
];


export const assignReportService = async (caseId, agencyId) => {

  const report = reports.find((report) => report.PK === `REPORT#${caseId}`);
  if (!report)
    return { statusCode: 404, data: { success: false, message: "Report not found" } };

  const agency = agencies.find((agency) => agency.PK === `AGENCY#${agencyId}`);
  if (!agency)
    return { statusCode: 404, data: { success: false, message: "Agency not found" } };

  if (report.Status !== "PENDING")
    return { statusCode: 409, data: { success: false, message: "This case can only be updated when its status is PENDING." } };


  const updateReport = {
    ...report,
    Status:"FORWARDED",
    AssignedAgencyID: agencyId,
    AcceptedAt: new Date().toISOString()
  };

 
  //สมมติว่าอัปเดตแล้ว
  return {statusCode: 200, data:{success: true, message:"The case has been successfully assigned to the agency.", data: updateReport}}

}