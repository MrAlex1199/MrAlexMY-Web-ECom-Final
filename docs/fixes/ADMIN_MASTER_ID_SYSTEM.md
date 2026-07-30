# Admin Master ID System - Complete Implementation

## Overview
ระบบ Admin ใหม่ที่ใช้ Master ID และ Role-based permissions แทนระบบเก่า พร้อมการจัดการสิทธิ์แบบลำดับชั้น

## Features Implemented

### 1. Master ID System
- **Master ID**: รหัสประจำตัวแอดมิน 6 ตัวอักษร (A-Z, 0-9)
- **Unique**: ไม่สามารถซ้ำกันได้
- **Uppercase**: แปลงเป็นตัวพิมพ์ใหญ่อัตโนมัติ

### 2. Role-based Hierarchy
10 บทบาทพร้อมระดับสิทธิ์:

| Master ID | Role | Level | Description |
|-----------|------|-------|-------------|
| EROGUN | Admin (Owner Master ID) | 10 | ผู้ดูแลระบบสูงสุด, จัดการผู้ใช้, ตั้งค่าระบบ, การเงิน |
| ED3M1A | Seller | 7 | จัดการสินค้าคงคลัง, รายละเอียดสินค้า, รับคำสั่งซื้อ, จัดส่งเบื้องต้น |
| EUMKGT | Warehouse Manager | 6 | จัดการการรับเข้า/เบิกจ่ายสินค้า, ตรวจนับสต็อก, พื้นที่เก็บสินค้า |
| E4CEP3 | Marketing Specialist | 5 | สร้างแคมเปญโปรโมชั่น, โฆษณา, วิเคราะห์ข้อมูลการขาย |
| E9M0EA | Customer Support Agent | 4 | ตอบคำถามลูกค้า, จัดการการคืน/เปลี่ยนสินค้า, ยกเลิกคำสั่งซื้อ |
| EXNIN8 | Finance Analyst | 5 | ตรวจสอบบัญชี, จัดการการชำระเงิน, กระทบยอด, รายงานการเงิน |
| EQ8ID2 | Content Creator | 3 | สร้างคำอธิบายสินค้า, รูปภาพ/วิดีโอ, จัดการเนื้อหาบล็อก |
| E29NXO | Developer (Junior) | 4 | แก้ไขบั๊กพื้นฐาน, ดูแลการอัปเดตฟีเจอร์เล็กน้อย |
| EJVLO6 | Data Entry Clerk | 2 | ป้อนข้อมูลสินค้าใหม่, อัปเดตข้อมูลลูกค้า, บันทึกคำสั่งซื้อ |
| EIXE86 | Logistics Coordinator | 4 | ติดตามสถานะจัดส่ง, ประสานงานบริษัทขนส่ง, จัดการเอกสารขนส่ง |

### 3. Permission System
แต่ละ Role มีสิทธิ์เฉพาะ:
- **all**: สิทธิ์เต็ม (เฉพาะ Owner Master ID)
- **products**: จัดการสินค้า
- **orders**: จัดการคำสั่งซื้อ
- **inventory**: จัดการสต็อก
- **promotions**: จัดการโปรโมชั่น
- **analytics**: ดูรายงานและสถิติ
- **customers**: จัดการลูกค้า
- **support**: ระบบสนับสนุน
- **finance**: การเงิน
- **content**: จัดการเนื้อหา
- **system**: ระบบ
- **shipping**: การจัดส่ง
- **users**: จัดการผู้ใช้

## Test Accounts Created

### Master Admin
- **Email**: erogun@admin.com
- **Password**: ErogunMaster123
- **Master ID**: EROGUN
- **Role**: Admin (Owner Master ID)

### Other Test Accounts
All passwords follow pattern: `[FirstPartOfRole]123456` or `[MasterID]Master123`

Examples:
- **ED3M1A**: Seller123456
- **EUMKGT**: Warehouse123
- **E4CEP3**: Marketing123
- **E9M0EA**: Support123456

## API Endpoints

### New Endpoints Added
- `POST /api/auth/create-master-admin` - สร้าง Master Admin (ครั้งแรกเท่านั้น)
- `GET /api/auth/roles` - ดึงรายการ Role ทั้งหมด
- `POST /api/auth/admin-register` - สร้างแอดมินใหม่ (ต้องมีสิทธิ์)

### Updated Endpoints
- `POST /api/auth/admin-login` - เข้าสู่ระบบแอดมิน (รองรับ Master ID)
- `GET /api/auth/admin` - ดึงข้อมูลแอดมิน (รวม permissions)

## Database Schema Updates

### Admin Model
```javascript
{
  email: String (required, unique),
  password: String (required),
  firstName: String (required),
  lastName: String (required),
  masterID: String (required, unique, 6 chars, A-Z0-9),
  phoneNumber: String (required),
  role: String (enum: roles, required),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: Admin),
  lastLogin: Date,
  permissions: [String] (auto-set based on role)
}
```

### New Methods
- `hasPermission(permission)` - ตรวจสอบสิทธิ์
- `getRoleLevel()` - ดึงระดับสิทธิ์
- `canManage(targetAdmin)` - ตรวจสอบว่าสามารถจัดการแอดมินคนอื่นได้หรือไม่

## Frontend Updates

### AdminRegister.jsx
- รองรับ Master ID input
- Role selection dropdown
- แสดงคำอธิบาย Role
- ตรวจสอบสิทธิ์ก่อนสร้าง
- Master Admin setup (ครั้งแรก)

### AdminLogin.jsx
- รองรับ Master ID ในการเข้าสู่ระบบ
- แสดงข้อมูล Role และ permissions

## Security Features

### Role-based Access Control
- แอดมินสามารถสร้างแอดมินที่มีระดับต่ำกว่าเท่านั้น
- เฉพาะ Owner Master ID ที่สามารถสร้างแอดมินระดับสูงได้
- ตรวจสอบสิทธิ์ทุกการเข้าถึง API

### Validation
- Master ID: 6 ตัวอักษร A-Z, 0-9 เท่านั้น
- Email: ไม่ซ้ำกัน
- Password: ตามมาตรฐานความปลอดภัย
- Role: ต้องอยู่ในรายการที่กำหนด

## Scripts Available

### Seed Data
```bash
# รีเซ็ตข้อมูลแอดมิน
npm run reset-admins

# สร้างข้อมูลทดสอบ
npm run seed-admins
```

## Usage Instructions

### 1. First Time Setup
1. เข้า `/admin-register`
2. ระบบจะแสดงหน้าสร้าง Master Admin
3. คลิก "สร้าง Master Admin"
4. เข้าสู่ระบบด้วย: `erogun@admin.com` / `ErogunMaster123`

### 2. Creating New Admins
1. เข้าสู่ระบบด้วย Master Admin
2. ไป `/admin-register`
3. กรอกข้อมูลและเลือก Role
4. ระบบจะตรวจสอบสิทธิ์อัตโนมัติ

### 3. Testing Different Roles
ใช้ test accounts ที่สร้างไว้เพื่อทดสอบสิทธิ์ต่างๆ

## Status: COMPLETE ✅

ระบบ Admin Master ID พร้อมใช้งานแล้ว พร้อมด้วย:
- ✅ Role-based permissions
- ✅ Master ID system  
- ✅ Hierarchical access control
- ✅ Test accounts
- ✅ Complete documentation
- ✅ Security validation
- ✅ Thai language support