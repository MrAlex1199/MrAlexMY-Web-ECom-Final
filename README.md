# Project MY Web E-Commerce

ระบบร้านค้าออนไลน์ E-Commerce พัฒนาด้วย React (Frontend) และ Node.js / Express (Backend) พร้อมระบบจัดเก็บข้อมูลด้วย MongoDB

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. ตั้งค่าฐานข้อมูลและ Environment
1. Setup MongoDB ใน Local หรือ MongoDB Atlas
2. สร้างและตั้งค่าไฟล์ `.env` ในโฟลเดอร์ `backend/`

### 2. ติดตั้ง Dependencies
เปิด Terminal แยก 2 หน้าต่างสำหรับ `frontend` และ `backend`:
```bash
# ในโฟลเดอร์ frontend
cd frontend
npm install

# ในโฟลเดอร์ backend
cd backend
npm install
```

### 3. รันโปรเจกต์
```bash
# ในโฟลเดอร์ frontend
npm start

# ในโฟลเดอร์ backend
npm start
```

### 4. การเข้าใช้งานผู้ดูแลระบบ (Admin Setup)
1. ตั้งค่า `EMPLOYEE_ID` ในไฟล์ `.env` ของ Backend ก่อนทำรายการสมัคร
2. ไปที่หน้า `/AdminRegister` เพื่อลงทะเบียนผู้ดูแลระบบ
3. ไปที่หน้า `/AdminProducts` เพื่ออัปโหลดข้อมูลสินค้า (`ProductData.csv` และ `HomeProduct.csv`)

---

## 🐳 การรันด้วย Docker (Docker Deployment)

1. ติดตั้ง Docker และ Docker Compose บนเครื่องเซิร์ฟเวอร์
2. รันคำสั่งด้วยไฟล์ `docker-compose.deploy.yml`:
```bash
docker-compose -f docker-compose.deploy.yml up -d
```

---

## 📚 เอกสารประกอบโปรเจกต์ (Documentation)

เอกสารรายละเอียดระบบ คู่มือการใช้งาน และประวัติการแก้ไขปัญหาสามารถดูได้จากไดเรกทอรี `docs/`:

### 📖 คู่มือการใช้งาน (Guides)
- 🛠️ [Git Setup Guide](docs/guides/GIT_SETUP_GUIDE.md) - คู่มือการใช้งานและตั้งค่า Git
- 📦 [Stock Validation Guide](docs/guides/STOCK_VALIDATION_GUIDE.md) - คู่มือระบบตรวจสอบและจัดการสต็อกสินค้า
- 👤 [User Account Management Guide](docs/guides/USER_ACCOUNT_MANAGEMENT_GUIDE.md) - คู่มือการจัดการบัญชีผู้ใช้งาน

### 🛡️ ความปลอดภัยและการปรับปรุง (Security & Improvements)
- 🔒 [Security Policy](SECURITY.md) - นโยบายและความปลอดภัยของระบบ
- 📈 [System Improvements](docs/IMPROVEMENTS.md) - รายการปรับปรุงและฟีเจอร์ที่พัฒนาเพิ่มเติม

### 🔧 ประวัติการแก้ไขระบบและเสถียรภาพ (System Fixes & Logs)
- 🔐 [Admin 403 Forbidden Fix](docs/fixes/ADMIN_403_FORBIDDEN_FIX.md)
- 🔑 [Admin Master ID System](docs/fixes/ADMIN_MASTER_ID_SYSTEM.md)
- ⏱️ [Admin Rate Limiting Fix](docs/fixes/ADMIN_RATE_LIMITING_FINAL_FIX.md)
- 🔄 [Admin Session Persistence & Stability](docs/fixes/ADMIN_SESSION_PERSISTENCE_FIX.md)
- 🛠️ [Admin System Complete Fix](docs/fixes/ADMIN_SYSTEM_COMPLETE_FIX.md)
- 📊 [CSV Upload Endpoint Fix](docs/fixes/CSV_UPLOAD_ENDPOINT_FIX.md)
- 🚚 [Order Status Fix](docs/fixes/ORDER_STATUS_FIX.md)
- ⚡ [Realtime Updates Implementation](docs/fixes/REALTIME_UPDATES_IMPLEMENTATION.md)
- 💻 [User Frontend Crash Fix](docs/fixes/USER_FRONTEND_CRASH_FIX.md)
