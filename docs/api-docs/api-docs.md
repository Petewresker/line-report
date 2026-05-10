# API Documentation

## Overview

Backend API ถูกออกแบบในรูปแบบ REST API สำหรับ:
- LINE LIFF Integration
- JWT Authentication
- RBAC
- Case Management
- Analytics
- Integration ระหว่าง Frontend และ Backend

Base Path:

```http
/api/v1
```

---

# Authentication

ระบบใช้ JWT Authentication ผ่าน Authorization Header

| Header | Description |
|---|---|
| Authorization | Bearer JWT Token |

JWT Payload:

```json
{
  "userId": "user-uuid",
  "role": "USER | ADMIN | AGENCY",
  "agencyId": "agency-uuid",
  "adminId": "admin-uuid"
}
```

---
# RBAC Permission

| Role | Responsibility |
|---|---|
| USER | แจ้งปัญหาและติดตามสถานะ |
| AGENCY | จัดการงานของหน่วยงาน |
| ADMIN | จัดการระบบและ Analytics |

---

# API Endpoint Summary

| Method | Endpoint | Availability | Permission | Description |
|---|---|---|---|---|
| GET | `/callback` | Available | USER, AGENCY, ADMIN | GET ประวัติ Case ของ User |
| GET | `/cases` | Available | ADMIN | GET Case ทั้งหมดในระบบ |
| POST | `/cases` | Available | USER | สร้าง Case ใหม่ |
| GET | `/cases/presigned-url` | Available | USER | Generate S3 Presigned URL |
| GET | `/cases/trends` | Available | ADMIN | GET Case Trends |
| GET | `/cases/hotspot` | Available | ADMIN | GET Heatmap Analytics |
| GET | `/cases/monthly` | Available | ADMIN | GET Monthly Statistics |
| POST | `/cases/mockpost` | Available | ADMIN (dev-only) | Generate Mock Cases |
| DELETE | `/cases/all` | Available | ADMIN (dev-only) | Delete All Cases |
| DELETE | `/cases/:userId` | Available | ADMIN (dev-only) | Delete User Cases |
| DELETE | `/cases/:caseId` | Available | ADMIN | Delete Specific Case |
| PATCH | `/admin/cases/{caseId}/reject` | Available | ADMIN | Reject Case |
| GET | `/agencies` | Available | ADMIN | GET Agency List |
| POST | `/agencies` | Available | ADMIN | Create Agency |
| GET | `/agencies/presign` | Available | AGENCY | Generate Agency Upload URL |
| PATCH | `/agencies/cases/:caseId/accept` | Available | AGENCY | Agency Accept Case |
| PATCH | `/agencies/cases/:caseId/complete` | Available | AGENCY | Agency Complete Case |
| GET | `/agencies/:agencyId/cases` | Available | AGENCY, ADMIN | GET Agency Cases |
| GET | `/agencies/:agencyId/cases/:caseId` | Available | AGENCY, ADMIN | GET Agency Case Detail |
| PATCH | `/agencies/:agencyId/approve` | Available | ADMIN | Approve Agency |
| PATCH | `/agencies/:agencyId/reject` | Available | ADMIN | Reject Agency |
| GET | `/agencies/all` | Available | ADMIN | GET All Agencies |
| GET | `/admin/users` | Available | ADMIN | GET Users |
| GET | `/admin/me` | Available | ADMIN | GET Current Admin |
| PATCH | `/admin/cases/:caseId/assign` | Available | ADMIN | Assign Case ให้ Agency |
| PATCH | `/admin/cases/:caseId/agencies/:agencyId` | Available | ADMIN | Update Agency Assignment |
| POST | `/auth/login` | Available | PUBLIC | LINE Login |
---

# Authentication APIs

| Endpoint | Description | Notes |
|---|---|---|
| `/auth/login` | Login ผ่าน LINE LIFF | Generate JWT |
| `/callback` | GET User Callback | ใช้หลัง Authentication |
| `/cases/presigned-url` | Generate Upload URL | JWT Required |
| `/agencies/presign` | Generate Agency Upload URL | Agency JWT Required |

---

# Case Management APIs

| Endpoint | Description | Permission |
|---|---|---|
| `GET /cases` | GET Case ทั้งหมด | ADMIN |
| `POST /cases` | สร้าง Case ใหม่ | USER |
| `DELETE /cases/:caseId` | Delete Case | ADMIN |
| `PATCH /admin/cases/{caseId}/reject` | Reject Case | ADMIN |
| `PATCH /admin/cases/:caseId/assign` | Assign Agency | ADMIN |
| `PATCH /admin/cases/:caseId/agencies/:agencyId` | Update Agency Assignment | ADMIN |

---

# Agency APIs

| Endpoint | Description | Permission |
|---|---|---|
| `GET /agencies` | GET Agency List | ADMIN |
| `POST /agencies` | Create Agency | ADMIN |
| `GET /agencies/all` | GET All Agencies | ADMIN |
| `PATCH /agencies/:agencyId/approve` | Approve Agency | ADMIN |
| `PATCH /agencies/:agencyId/reject` | Reject Agency | ADMIN |
| `GET /agencies/:agencyId/cases` | GET Cases ของ Agency | AGENCY, ADMIN |
| `GET /agencies/:agencyId/cases/:caseId` | GET Case Detail | AGENCY, ADMIN |
| `PATCH /agencies/cases/:caseId/accept` | Accept Case | AGENCY |
| `PATCH /agencies/cases/:caseId/complete` | Complete Case | AGENCY |

---

# Analytics APIs

| Endpoint | Description | Usage |
|---|---|---|
| `/cases/trends` | Aggregate Case Trends | Dashboard Analytics |
| `/cases/hotspot` | Heatmap Data | Geospatial Visualization |
| `/cases/monthly` | Monthly Statistics | Reporting |
| `/cases/resolution` | Resolution Metrics | Admin Analytics |

---

# Development APIs

| Endpoint | Description | Environment |
|---|---|---|
| `/cases/mockpost` | Generate Mock Data | dev-only |
| `/cases/all` | Delete All Cases | dev-only |
| `/cases/:userId` | Delete User Cases | dev-only |

---

# S3 Upload Flow

| Step | Description |
|---|---|
| 1 | Frontend Request Presigned URL |
| 2 | Backend Generate S3 Upload URL |
| 3 | Frontend Upload File Directly เข้า S3 |
| 4 | Frontend ส่ง File Key เข้า API |
| 5 | Backend Save Metadata ลง Database |

---
