# คู่มือระบบจัดการบัญชีผู้ใช้ (User Account Management System)

## ภาพรวมระบบ

ระบบจัดการบัญชีผู้ใช้ที่สมบูรณ์ รวมถึงการเปลี่ยนรหัสผ่าน การกู้คืนรหัสผ่าน การเปลี่ยนอีเมล และการลบบัญชี

## ฟีเจอร์ที่มีอยู่

### 1. การเปลี่ยนรหัสผ่าน (Change Password)
- **หน้า**: `/SettingUser`
- **API Endpoint**: `PUT /api/auth/change-password`
- **ความต้องการ**: รหัสผ่านปัจจุบัน + รหัสผ่านใหม่
- **การตรวจสอบ**: 
  - รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร
  - ต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข
  - ต้องยืนยันรหัสผ่านปัจจุบัน

### 2. การกู้คืนรหัสผ่าน (Password Recovery)
- **หน้าขอรีเซ็ต**: หน้า Login (ปุ่ม "ลืมรหัสผ่าน?")
- **หน้ารีเซ็ต**: `/reset-password`
- **API Endpoints**:
  - `POST /api/auth/forgot-password` - ขอลิงก์รีเซ็ต
  - `POST /api/auth/reset-password` - รีเซ็ตรหัสผ่านด้วย token

#### วิธีการใช้งาน:
1. ผู้ใช้กดปุ่ม "ลืมรหัสผ่าน?" ในหน้า Login
2. กรอกอีเมลและกดส่ง
3. ระบบจะสร้าง reset token (ในโหมด development จะแสดงใน console และ alert)
4. ใช้ token ในหน้า `/reset-password` เพื่อตั้งรหัสผ่านใหม่

### 3. การเปลี่ยนอีเมล (Change Email)
- **หน้า**: `/SettingUser`
- **API Endpoint**: `PUT /api/auth/change-email`
- **ความต้องการ**: อีเมลใหม่ + รหัสผ่านปัจจุบัน
- **การตรวจสอบ**:
  - อีเมลใหม่ต้องไม่ซ้ำกับที่มีอยู่ในระบบ
  - ต้องยืนยันรหัสผ่านปัจจุบัน

### 4. การลบบัญชี (Delete Account)
- **หน้า**: `/SettingUser`
- **API Endpoint**: `DELETE /api/auth/delete-account`
- **ความต้องการ**: รหัสผ่านปัจจุบัน
- **การทำงาน**:
  - แสดง popup ยืนยัน
  - ต้องกรอกรหัสผ่านเพื่อยืนยัน
  - ลบข้อมูลผู้ใช้ออกจากฐานข้อมูล
  - ล้าง localStorage และ redirect ไปหน้าแรก

## โครงสร้างไฟล์

### Backend Files:
```
backend/
├── controllers/authController.js     # ฟังก์ชันจัดการ authentication
├── middleware/validation.js          # validation middleware
├── routes/auth.js                    # auth routes
└── models/User.js                    # User model
```

### Frontend Files:
```
frontend/src/
├── pages/
│   ├── SettingUser.jsx              # หน้าตั้งค่าบัญชี
│   ├── Login.jsx                    # หน้า login (มี forgot password)
│   └── PasswordReset.jsx            # หน้ารีเซ็ตรหัสผ่าน
└── App.js                           # routing configuration
```

## API Endpoints

### Authentication Routes (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/change-password` | เปลี่ยนรหัสผ่าน | ✅ |
| POST | `/forgot-password` | ขอลิงก์รีเซ็ตรหัสผ่าน | ❌ |
| POST | `/reset-password` | รีเซ็ตรหัสผ่านด้วย token | ❌ |
| PUT | `/change-email` | เปลี่ยนอีเมล | ✅ |
| DELETE | `/delete-account` | ลบบัญชี | ✅ |

## การตรวจสอบความปลอดภัย (Security Features)

### 1. Rate Limiting
- จำกัดการเรียก API auth endpoints
- Production: 5 ครั้งต่อ 15 นาที
- Development: 20 ครั้งต่อ 15 นาที

### 2. Password Validation
- อย่างน้อย 8 ตัวอักษร
- ต้องมีตัวพิมพ์เล็ก (a-z)
- ต้องมีตัวพิมพ์ใหญ่ (A-Z)  
- ต้องมีตัวเลข (0-9)

### 3. JWT Token Security
- Reset token มีอายุ 1 ชั่วโมง
- ต้องระบุ type เป็น 'password-reset'
- ตรวจสอบ token signature

### 4. Email Privacy
- ไม่เปิดเผยว่าอีเมลมีอยู่ในระบบหรือไม่
- ส่งข้อความเดียวกันทั้งกรณีที่มีและไม่มีอีเมล

## การใช้งานในโหมด Development

### Password Reset Token
ในโหมด development ระบบจะแสดง reset token ใน:
- Console log
- Alert popup
- Response body

### การทดสอบ
1. **เปลี่ยนรหัสผ่าน**: ไปที่ `/SettingUser` → กรอกรหัสผ่านเก่าและใหม่
2. **กู้คืนรหัสผ่าน**: ไปที่ `/login` → กด "ลืมรหัสผ่าน?" → ใช้ token ที่ได้
3. **เปลี่ยนอีเมล**: ไปที่ `/SettingUser` → กด "Change" ที่ส่วนอีเมล
4. **ลบบัญชี**: ไปที่ `/SettingUser` → กด "Continue with deletion"

## ข้อความแจ้งเตือน (User Messages)

ระบบใช้ข้อความภาษาไทยสำหรับ user-facing messages:
- "เปลี่ยนรหัสผ่านสำเร็จ"
- "กรุณาเข้าสู่ระบบใหม่"
- "รหัสผ่านปัจจุบันไม่ถูกต้อง"
- "อีเมลนี้ถูกใช้งานแล้ว"
- "ลบบัญชีสำเร็จ"

## การปรับแต่งเพิ่มเติม

### การส่งอีเมล (Email Integration)
ปัจจุบันระบบยังไม่ได้เชื่อมต่อกับ email service จริง สำหรับ production ควร:
1. เพิ่ม email service (SendGrid, AWS SES, etc.)
2. สร้าง email templates
3. ลบการแสดง reset token ใน response

### การปรับปรุงความปลอดภัย
1. เพิ่ม CAPTCHA สำหรับ forgot password
2. เพิ่ม 2FA (Two-Factor Authentication)
3. Log การเปลี่ยนแปลงบัญชีสำคัญ
4. เพิ่มการยืนยันอีเมลก่อนเปลี่ยน

### การปรับปรุง UX
1. เพิ่ม progress indicator
2. เพิ่ม password strength meter
3. เพิ่มการแจ้งเตือนผ่าน toast notifications
4. เพิ่มการยืนยันก่อนการเปลี่ยนแปลงสำคัญ

## การแก้ไขปัญหา (Troubleshooting)

### ปัญหาที่อาจพบ:
1. **Token หมดอายุ**: ใช้ forgot password ใหม่
2. **รหัสผ่านไม่ผ่าน validation**: ตรวจสอบความยาวและรูปแบบ
3. **อีเมลซ้ำ**: ใช้อีเมลอื่นที่ไม่มีในระบบ
4. **401 Unauthorized**: ตรวจสอบ token ใน localStorage

### การ Debug:
1. ตรวจสอบ browser console สำหรับ errors
2. ตรวจสอบ network tab สำหรับ API responses
3. ตรวจสอบ backend logs สำหรับ server errors

## สรุป

ระบบจัดการบัญชีผู้ใช้นี้ครอบคลุมฟีเจอร์หลักที่จำเป็นสำหรับเว็บแอปพลิเคชันสมัยใหม่ พร้อมความปลอดภัยและ user experience ที่ดี สามารถนำไปใช้งานได้ทันทีและปรับแต่งเพิ่มเติมตามความต้องการ