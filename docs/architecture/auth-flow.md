# Authentication Flow Architecture

## Overview

ในช่วงแรกของการพัฒนา ระบบใช้วิธีการให้ Frontend ดึง userId จาก LINE LIFF แล้วส่งมายัง Backend ผ่าน Request Body โดยตรง Architecture ลักษณะนี้สามารถทำงานได้ในเชิง Functional แต่มีปัญหาในด้าน Security และ Trust Boundary เนื่องจาก Backend ไม่มีวิธีตรวจสอบว่า userId ที่ถูกส่งมานั้นเป็นของจริงหรือไม่ ดังนั้นใน Sprint 2-1 ระบบ Authentication จึงถูก Refactor ใหม่เพื่อเพิ่ม Authentication Flow ที่ถูกต้องเข้าสู่ระบบ

---

# Previous Architecture (Sprint 1)

Flow เดิมของระบบ:

```text
Frontend (LIFF)
    ↓
ดึง userId จาก LIFF
    ↓
ส่ง userId เข้า Backend โดยตรง
    ↓
Backend ใช้ userId เพื่ออ้างอิงข้อมูลผู้ใช้งาน
```

ปัญหาของ Architecture เดิม:
- Backend เชื่อข้อมูลจาก Frontend โดยตรง
- สามารถเกิดการ Spoof userId ได้
- ไม่มีการ Verify ตัวตนของผู้ใช้งานจริง
- ยังไม่เหมาะสำหรับระบบ RBAC ในระยะยาว

---

# New Architecture (Sprint 2-1)

Authentication Flow ใหม่:

```text
Frontend (LIFF)
    ↓
Get LINE ID Token
    ↓
ส่ง ID Token ไปยัง Backend
    ↓
Backend Verify Token กับ LINE API
    ↓
Extract LINE User Identifier (sub)
    ↓
Generate App JWT
    ↓
ส่ง JWT กลับไปยัง Frontend
```

จุดประสงค์ของการ Refactor:
- เพิ่มความถูกต้องของ Authentication
- ลดความเสี่ยงจากการปลอม userId
- แยก Trust Boundary ระหว่าง Frontend และ Backend
- เตรียมระบบสำหรับ RBAC และ Protected API

---

# Authentication Components

## LINE LIFF

Frontend ใช้ LINE LIFF SDK สำหรับ:
- Login ผ่าน LINE
- ดึง LINE ID Token
- เชื่อมต่อ User Session

---

## Backend Authentication Layer

Backend รับผิดชอบ:
- Verify LINE ID Token
- ตรวจสอบความถูกต้องของ Token
- จัดการ User ภายในระบบ
- Generate JWT สำหรับใช้ภายในระบบ

---

## JWT Authentication

หลัง Verify สำเร็จ Backend จะ Generate App JWT สำหรับ:
- ใช้ Authentication ภายในระบบ
- ใช้ระบุสิทธิ์ของผู้ใช้งาน
- รองรับ Role-Based Access Control (RBAC)

---

# RBAC Design

ระบบมีการเตรียมโครงสร้างสำหรับ Role-Based Access Control (RBAC)

Role หลักภายในระบบ:
- User
- Agency
- Admin

Backend จะเป็นผู้จัดการสิทธิ์ของแต่ละ Role และใช้ JWT เป็นตัวระบุ Session ของผู้ใช้งาน

---

# Security Improvements

หลัง Refactor ระบบ Authentication:
- Backend ไม่เชื่อข้อมูลจาก Frontend โดยตรง
- เพิ่ม Token Verification
- เพิ่ม Authentication Layer
- ลดความเสี่ยงจากการปลอมข้อมูลผู้ใช้งาน
- รองรับ Protected API และ RBAC ในอนาคต

---

# Related Documents

| Document | Description |
|---|---|
| `CONTRIBUTING.md` | ภาพรวมการทำงานของทีม |
| `docs/testing/` | เอกสารการทดสอบระบบ |
| `docs/architecture/` | เอกสารออกแบบระบบ |