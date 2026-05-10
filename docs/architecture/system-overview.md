# System Overview

## Overview

LINE Report System เป็นระบบที่พัฒนาขึ้นเพื่อใช้สำหรับจัดการข้อมูลและ Workflow ภายในระบบผ่าน LINE LIFF โดยมีการเชื่อมต่อระหว่าง Frontend, Backend API และ Database

---

# High Level Architecture

```text
Frontend(LINE LIFF + Vercel)
        ↓
Backend API Service (API Gateway + Lambda)
        ↓                       ↓
Database Layer (DynamoDB)   S3 Bucket(store image)
```

Frontend ทำหน้าที่:
- จัดการ User Interface
- เชื่อมต่อ LINE LIFF
- ส่ง Request ไปยัง Backend API
- จัดการ Session ของผู้ใช้งาน

Backend ทำหน้าที่:
- จัดการ Authentication
- Verify Token
- จัดการ Business Logic
- เชื่อมต่อ Database
- จัดการ RBAC และ Protected API

Database ทำหน้าที่:
- จัดเก็บข้อมูลผู้ใช้งาน
- จัดเก็บข้อมูลภายในระบบ
- รองรับ Resource Hierarchy และ Role Management

---

# Frontend Architecture

Frontend ถูกพัฒนาร่วมกับ LINE LIFF เพื่อให้ผู้ใช้งานสามารถเข้าถึงระบบผ่าน LINE Application ได้โดยตรง

หน้าที่หลักของ Frontend:
- Initialize LIFF Application
- Login ผ่าน LINE
- รับ LINE ID Token
- เชื่อมต่อ Backend API
- Render UI ตามสิทธิ์ของผู้ใช้งาน

Tools และ Components ที่เกี่ยวข้อง:
- LINE LIFF SDK
- Frontend Framework
- API Service Layer

---

# Backend Architecture

Backend API ถูกออกแบบให้แยก Layer ของระบบออกจากกันเพื่อลด Coupling ภายในระบบ

หน้าที่หลัก:
- Authentication & Authorization
- API Service
- Database Integration
- JWT Management
- RBAC Validation
- Business Logic

ภายในระบบมีการ Refactor Authentication Architecture ใน Sprint 2 เพื่อเพิ่ม Security Layer ให้ถูกต้องมากขึ้น

รายละเอียดเพิ่มเติม:
- `docs/architecture/auth-flow.md`

---

# Database Design

Database ถูกออกแบบเพื่อรองรับ:
- User Management
- Role Management
- Resource Management
- Authentication Flow

โครงสร้าง Database มีการอ้างอิง Resource Hierarchy และ RBAC ภายในระบบเพื่อเตรียมรองรับการขยาย Feature ในอนาคต

---

# RBAC Structure

ระบบมีการออกแบบ Role-Based Access Control (RBAC) เพื่อควบคุมสิทธิ์ของผู้ใช้งานแต่ละประเภท

Role หลัก:
- User
- Agency
- Admin

Backend จะเป็นผู้ตรวจสอบสิทธิ์ในการเข้าถึง Resource ต่าง ๆ ภายในระบบ

---

# Integration Flow

ตัวอย่าง Integration ภายในระบบ:
- Frontend ↔ Backend API
- Backend ↔ Database
- LINE LIFF ↔ Authentication Service

ทีมมีการทดสอบ Integration ระหว่างส่วนต่าง ๆ ของระบบอย่างต่อเนื่องในแต่ละ Sprint เพื่อให้ระบบสามารถทำงานร่วมกันได้ถูกต้อง

---

# Testing Approach

ระบบมีการ Testing อ้างอิงตาม:
- Userflow
- API Behavior
- Authentication Logic
- RBAC Flow

---

# Deployment & Environment

ภายใน Project มีการจัดการ Environment และ Tools สำหรับ Development เช่น:
- AWS CLI
- SAM CLI
- LINE Developer Console

รวมถึงมีการ Setup Environment สำหรับการเชื่อมต่อระหว่าง Frontend, Backend และ External Service

---

# Related Documents

| Document | Description |
|---|---|
| `CONTRIBUTING.md` | ภาพรวมการทำงานของทีม |
| `docs/architecture/auth-flow.md` | Authentication Architecture |
| `docs/testing/` | เอกสารการทดสอบระบบ |
| `README.md` | Project Overview |