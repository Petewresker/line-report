# CONTRIBUTING

Repository นี้ประกอบไปปด้วย
- Source Code
- Design Documents
- Planning Documents
- Sprint/task Tracking
- API & Database Design
- Testing & Integration Documents

---

# Member

| Member | Role | Responsibility |
|---|---|---|
| 6709681107 | บริวัฒน์ สงนุ้ย | ทีม | Backend / Authentication / System Design | Implemet Backend Service, Design JWT Authentication, RBAC Flow, Backend Architecture, API |
| 6709616764 | พีรภัทร เอกดิษฐ์ | พีท | Frontend / LIFF Integration / Deployment / System Design | Implement Frontend, เชื่อมต่อ LINE LIFF และ Backend API, ดูแล Environment Setup|
| 6709681149 | ภาณุพงศ์ สุทธิเกษม | ฟีล์ม | Backend / Authentication / API Support | Implement Authentication และ Backend Service |
| 6709616913 | สาโรจน์ พราหมณ์แก้ว | เจมส์ | Frontend / Figma Design / Integrator | Implement Frontend, Design Figma, Integration Test, Userflow Test |
| 6709616541 | ธีธัช บุญประเสริฐชัย | ปูอัด | Frontend / Figma Design / Tester | Implement Frontend, Design Figma และ Userflow Test |
| 6709616574 | นวพรรษ ทำไธสง | โฟกัส | Frontend / Backend / Database / Tester-Integrator | Design Database, Integration Test, Userflow Test |
| 6709616673 | นายพรินทาน หนุนชู | แคมป์ | Backend / Database / System Design| Implemet Backend Service, Design API, Userflow Test Support|
| 6709681115 | นายปวริศร์ มั่งนิมิตร | ฟีฟ่า | Frontend / System Design / Tester | Implement Backend Service, Userflow Test, Integration Test Support|

> Discalimer : Member ทุกคนมีส่วนร่วมในหลายส่วนของระบบร่วมกัน ไม่ได้แบ่งหน้าที่แบบตายตัว

---

# Contribution Overview

## Authentication & Authorization

Main Tasks:
- ปรับปรุงระบบ Authentication จากเดิมที่ Frontend ส่ง userId โดยตรง (Sprint 2-1)
- เปลี่ยนมาใช้ LINE ID Token Verification (Sprint 2-1)
- ให้ Backend เป็นผู้ตรวจสอบ Token (Sprint 2-1)
- ออก App JWT สำหรับใช้ภายในระบบ (Sprint 2-1)
- เตรียมโครงสร้างสำหรับ Role-Based Access Control (RBAC) (Sprint 1)

Evidence:
- `docs/architecture/auth-flow.md`
- Backend Authentication Logic
- API Integration
- JWT Verification Flow

---

## Frontend Development

Main Tasks:
- พัฒนา LIFF Frontend (Sprint 1)
- เชื่อมต่อ API ระหว่าง Frontend และ Backend (Sprint 1)
- จัดการ User Flow (Sprint 1)
- Render UI ตามสิทธิ์ของผู้ใช้งาน (Sprint 1)

Evidence:
- Frontend Source Code
- API Connection
- LIFF Integration

---

## Backend & Database

Main Tasks:
- พัฒนา Backend API (Sprint 1)
- จัดการฐานข้อมูล (Sprint 1)
- ออกแบบโครงสร้างข้อมูลผู้ใช้งาน (Sprint 1)
- จัดการ Role และ Token ภายในระบบ (Sprint 1)

Evidence:
- Backend Source Code
- Database Schema
- API Logic

---

## Testing & Integration

Main Tasks:
- ทดสอบ User Flow (Sprint 1, Sprint 2)
- ทดสอบการเชื่อมต่อระหว่างระบบ (Sprint 1, Sprint 2)
- ทดสอบหลายรูปแบบของผู้ใช้งาน: (Sprint 1, Sprint 2)
  - User
  - Agency
  - Admin

Evidence:
- Test Plan
- Integration Testing
- User Story Validation

---

# Summarize Project Collaboration Workflow (Sprint 1 - 2)

Sprint 1 (11/03/2026 - 31/03/2026)
- Voting ทุกคนต้องหาหัวข้อและคิดวิธีการแก้ไขปัญหาและ Tech Stack คร่าวๆแล้วกลุ่มจะนำมาเลือกการผ่านการโหวต
- ออกแบบ Tech Stack (Architecture Diagram)
- List Tools ที่อาจจะต้องใช้
- เรียนรู้ Tools ที่ใช้ใน Project (AWS CLI, SAM CLI, LINE LIFF)
- ออกแบบ API Document, No SQL Schema Database อ้างอิง Quarry, Project File Structure, RBAC Design, Resource Hierarchy, Authentication & Authorization, Userflow
- เริ่ม Implement ตามที่ได้ออกแบบไว้
- Integrate&test เบื่องต้น
- จัดทำสไลด์ & เตรียมการนำเสนอ
- นำเสนอโปรเจค

Sprint 2-1 (6/04/2026 - 27/04/2026)
- Backend แก้ไขระบบในหลาย Layer ของ Architecture เพื่อเพิ่ม Authentication Flow ที่ถูกต้องเข้าสู่ระบบ
- Tester ทดสอบระบบอย่างระเอียดโดยอ้างอิงจาก Userflow จากนั้นทำ Document เพื่อจัดเตรียมให้ Backend นำไปแก้ไขต่อใน Sprint ต่อไป

Sprint 2-2 (6/04/2026 - 27/04/2026)
- Integrator ทำการ Test ระบบทุกเส้นอีกครั้งหลังเพิ่ม Authentication layer พร้อมทำ Document และแก้ไข Error ที่เกิดขึ้น
- Backend ทำการแก้ไข Bug ที่อยู่ในระบบโดยอ้างอิงจาก Document ที่ Tester ทำมาใน Sprint ที่ผ่านมา 
- Tester เปลี่ยนหน้าที่ไปทำสไลด์เตรียม Presentation และ Content ที่ต้องนำเสนอใน Demo

---

# Document Repository

| Document | Detail |
|---|---|
| `README.md` | ภาพรวมของระบบและวิธีใช้งาน |
| `docs/architecture/` | เอกสารออกแบบระบบและ Authentication Flow |
| `docs/testing/` | เอกสารการทดสอบระบบ |
| `docs/meetings/` | บันทึกการประชุมและ Sprint Planning |
| `docs/management/` | เอกสารการจัดการงานและการแบ่งหน้าที่ |

---

# Additional Notes

เนื่องจาก Project ในตอน Implement จริงเกิดการที่ต้องแก้ Architecture หลายครั้ง หลายส่วนของระบบจึงมีการ Refactor และ Integrate ข้าม Sprint อยู่ตลอดเวลา

ทีมมีการใช้:
- Shared Documents
- Architecture Diagram
- Sprint Planning
- Testing Documents
- GitHub Repository
