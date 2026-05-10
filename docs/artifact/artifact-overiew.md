# Project Artifact Overview

## Overview
Artifact นี้อ้างอิงจาก Google Sheet ของกลุ่ม: https://docs.google.com/spreadsheets/d/1hoJ3BpT5pQg8Nw_GRG615bwY6BLUbkhHKbE4n773-k8/edit?gid=259230209#gid=259230209

Artifact ภายใน Project ถูกใช้สำหรับ:
- วางแผนงาน
- ติดตามความคืบหน้า
- ออกแบบระบบ
- Integrate ระบบ
- ทดสอบระบบ
- Refactor Architecture
- ตรวจสอบปัญหาระหว่าง Development

ภายในแต่ละ Sprint ทีมมีการแบ่งงาน, Integrate และ Test ระบบร่วมกันอย่างต่อเนื่อง โดยใช้ Shared Documents และ GitHub Repository เป็นศูนย์กลางในการทำงานร่วมกัน

---

# Sprint 1 Artifacts

| Task Type | Description | Member | Evidence |
|---|---|---|---|
| Design API | Design API Structure | ฟีฟ่า, ปูอัด, แค้ม, ทีม | https://docs.google.com/spreadsheets/d/1hoJ3BpT5pQg8Nw_GRG615bwY6BLUbkhHKbE4n773-k8/edit?gid=983331672#gid=983331672 |
| Design Figma | Design และ Modified UI | ปูอัด, เจมส์ | https://www.figma.com/design/RMqi7ZUJ9QGX07huoa008e/AWS-CS232?node-id=0-1&t=nvURh8fs3HFpO4Y3-1 |
| Design Database | ออกแบบ Database Structure | ทีม, โฟกัส, พีท | https://app.eraser.io/workspace/yI0In6ER3kjxq8ApLMXS |
| Repository Setup | Setup GitHub Repository | พีท | https://github.com/Petewresker/line-report.git |
| BE Feature | edit case เพื่อเตรียม Integration Test | โฟกัส | https://github.com/Petewresker/line-report/tree/be/editCase |
| FE Feature | พัฒนา Frontend Admin | ปูอัด | https://github.com/Petewresker/line-report/commit/00423fb5a55997f5ed72bd4168eb7b3f27c3bb0b |
| BE Feature | Agency เห็นและจัดการงานของตัวเอง | ฟีฟ่า, ทีม | https://github.com/Petewresker/line-report/tree/be/agencies-cases |
| BE Feature | ช่างกดรับงานและ Update Status | แค้ม, ทีม | https://github.com/Petewresker/line-report/tree/be/caseAccept |
| BE Feature | POST Case เข้าสู่ระบบ | ทีม | https://github.com/Petewresker/line-report/tree/be/postCase |
| BE Feature | Reject Case Function | ปูอัด | https://github.com/Petewresker/line-report/tree/be/casesAdmin |
| BE Feature | GET User Case History | พีท, แค้ม | https://github.com/Petewresker/line-report/tree/be/callback |
| BE Feature | Admin Assign งานให้หน่วยงาน | ฟิล์ม, โฟกัส | https://github.com/Petewresker/line-report/commits/be/Admin-assign/ |
| BE Feature | LINE Integration | พีท | https://github.com/Petewresker/line-report/commits/fe/line |
| Integration & Bug Fixing | Integrate และแก้ Bug | พีท | https://github.com/Petewresker/line-report/commit/25f92ee104f4f541e3697dbb405f1a61bb19f253 |

---

# Sprint 2-1 Artifacts

## Authentication Refactor

ใน Sprint นี้ Backend มีการ Refactor Authentication Architecture ใหม่ทั้งระบบ เพื่อเพิ่ม Authentication Flow ที่ถูกต้องเข้าสู่ระบบ

Flow ใหม่ประกอบด้วย:
- LINE ID Token Verification
- Backend JWT Generation
- Protected API
- RBAC Preparation

รายละเอียดเพิ่มเติม:
- `docs/architecture/auth-flow.md`

---

| Task Type | Description | Member | Evidence |
|---|---|---|---|
| BE Feature | เขียน JWT Authentication Layer | ฟิล์ม | https://github.com/Petewresker/line-report/commit/84c2eb0dc95522de26ea5807b51a7fa9e80886ca |
| Flow Test | Test User Flow ตาม Diagram | ปูอัด | https://docs.google.com/document/d/1y0IayX78bI_he07tFpWyqG6H_vc2FpGx3Q-uFWwDzQE/edit?tab=t.0 |
| Flow Test | Test Agency Flow | ฟีฟ่า | https://docs.google.com/document/d/1y0IayX78bI_he07tFpWyqG6H_vc2FpGx3Q-uFWwDzQE/edit?tab=t.rchii9z1zd2v |
| Flow Test | Test Admin Flow | เจมส์, โฟกัส | https://docs.google.com/document/d/1y0IayX78bI_he07tFpWyqG6H_vc2FpGx3Q-uFWwDzQE/edit?tab=t.nvwofpeksbrk#heading=h.qeaivf5wrmtb |
| BE Feature | เพิ่ม JWT ใน Agency | ทีม | https://github.com/Petewresker/line-report/commit/a193f14d2c2208d9b86e91cc27f243bd62695abe |
| BE Feature | เพิ่ม JWT ใน Admin | ฟิล์ม | https://github.com/Petewresker/line-report/commit/85a16e51062c31a9d24000271c798dd9f669b9e6 |
| BE Feature | เพิ่ม JWT ใน User | แค้ม | https://github.com/Petewresker/line-report/commit/0ca563d4eb8a34ba74ad6433828c44e0d4b1fe35 |
| BE Bug Fixing | แก้ Bug ใน Agency และ Admin | ทีม | https://github.com/Petewresker/line-report/commit/f65fd6bd2dba7384728455bdc491dd42f095a8b7 |
| BE Bug Fixing | แก้ Bug ใน Agency | แค้ม | https://github.com/Petewresker/line-report/commit/96fc096febbc90380f4d0e4aeb0b0ffd93301a85 |
| BE Bug Fixing | ปรับ Database ให้ Compatible กับ Auth Logic | พีท | https://docs.google.com/document/d/1y0IayX78bI_he07tFpWyqG6H_vc2FpGx3Q-uFWwDzQE/edit?tab=t.6m7y3sxp2e86 |
| Integration Test | เพิ่ม JWT ใน Authorization Header | เจมส์, โฟกัส, พีท | https://github.com/Petewresker/line-report/tree/IntLab_admin |

---

# Sprint 2-2 Artifacts

| Task Type | Description | Member | Evidence |
|---|---|---|---|
| FE Feature | Modified Flex Message UI | ปูอัด | https://github.com/Petewresker/line-report/tree/int/sprint2 |
| Integration Test | Test API User หลังเพิ่ม Auth Layer | พีท | https://docs.google.com/document/d/1y0IayX78bI_he07tFpWyqG6H_vc2FpGx3Q-uFWwDzQE/edit?tab=t.xu9kgvkc8589 |
| Integration Test | Test API Agency หลังเพิ่ม Auth Layer | โฟกัส | https://docs.google.com/document/d/1y0IayX78bI_he07tFpWyqG6H_vc2FpGx3Q-uFWwDzQE/edit?tab=t.6i150seru8cs |
| Integration Test | Test API Admin หลังเพิ่ม Auth Layer | เจมส์ | https://docs.google.com/document/d/1y0IayX78bI_he07tFpWyqG6H_vc2FpGx3Q-uFWwDzQE/edit?tab=t.i155q4chpxkr |
| BE Feature | Mock Data สำหรับ Integration Test | โฟกัส | https://github.com/Petewresker/line-report/commit/8f604a1e2c2ddb794d2021c849ad84a1bcca8c9f |
| BE Feature | Delete Data Utility สำหรับ Integration Test | เจมส์ | https://github.com/Petewresker/line-report/commit/fbd0b2959cb60b095f7b2db67d9ac6eea70bd748 |
| FE Feature | สร้างหน้าการ Reject Case | ปูอัด | https://github.com/Petewresker/line-report/tree/int_admin |
| BE Fixing Bug | แก้บัคให้ Map สามารถค้าหาสถานที่ได้ | เจมส์ | https://github.com/Petewresker/line-report/commit/0e2140d8674c66aaeeb423ac7035e72164c55f30 |
| BE Feature | สร้าง endpoint case reject | ปูอัด | https://github.com/Petewresker/line-report/commit/25d4631673c4297e8370b1fdecc8f1ba58414a40 |
| Integration Test |  แก้บัคให้ admin สามารถ assign สถานะได้แค่ 1 ครั้ง (FE) | เจมส์ | https://github.com/Petewresker/line-report/commit/c266aa439608a4b6925d5e5cd8b2fc1ab60bb463 |

---

# Related Documents

| Document | Description |
|---|---|
| `CONTRIBUTING.md` | ภาพรวมการมีส่วนร่วมของสมาชิก |
| `docs/architecture/auth-flow.md` | Authentication Architecture |
| `docs/architecture/system-overview.md` | ภาพรวมระบบ |
| `docs/testing/` | Testing Evidence และ Integration Documents |

---