# Requirement
1. AWS CLI (Deployment)
2. SAM CLI (Deployment)
3. AWS Toolkit (Development)
# Set-up Backend
1. Clone Repo
2. ติดตั้ง Node Module ด้วยคำสั่ง ```npm install``` ในโฟล์เดอร์ Function และ Frontend
3. เข้าไปโฟล์เดอร์ที่มีไฟล์ template.yaml แล้วใช้คำสั่ง ```sam build``` (จำเป็นที่จะต้อง ```aws configure``` ก่อนโดยสามารถหา key ได้จาก Learner Lab)
4. ```sam deploy --guide``` เพื่อ Deploy Cloudformation
# เชื่อมต่อ API Gateway กับ Line frontend
1. สร้าง .env.local ที่ src/frontend แล้ว Config ดังนี้
```
NEXT_PUBLIC_LIFF_ID=
NEXT_PUBLIC_LIFF_ID_AGENCY=
NEXT_PUBLIC_LIFF_ID_PROBLEM_SEEKER=
NEXT_PUBLIC_LIFF_ID_AGENCYWEB=

NEXT_PUBLIC_API_URL= ลิงค์สำหรับ API Gateway
```
2. npm run dev
