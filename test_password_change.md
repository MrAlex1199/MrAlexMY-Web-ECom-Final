# การทดสอบระบบเปลี่ยนรหัสผ่าน

## ปัญหาที่พบ
- ระบบแจ้งว่าเปลี่ยนรหัสผ่านสำเร็จ
- แต่ไม่สามารถล็อกอินด้วยรหัสผ่านใหม่ได้

## สาเหตุที่เป็นไปได้
1. **การใช้ bcrypt.compare แทน model method**: ใช้ bcrypt.compare โดยตรงแทนที่จะใช้ comparePassword method ที่มีอยู่ใน User model
2. **การ hash รหัสผ่านซ้ำ**: อาจมีการ hash รหัสผ่านซ้ำในขั้นตอนต่างๆ
3. **การเปรียบเทียบรหัสผ่านไม่สอดคล้องกัน**: ใช้วิธีการเปรียบเทียบที่แตกต่างกันใน login และ changePassword

## การแก้ไขที่ทำ

### 1. แก้ไข authController.js
- เปลี่ยนจาก `bcrypt.compare(password, user.password)` เป็น `user.comparePassword(password)`
- ใช้ method เดียวกันทั้งใน login และ changePassword
- เพิ่ม error handling สำหรับ validation errors

### 2. ฟังก์ชันที่แก้ไข:
- `loginUser()` - ใช้ `existingUser.comparePassword(password)`
- `changePassword()` - ใช้ `user.comparePassword(currentPassword)`
- `changeEmail()` - ใช้ `user.comparePassword(password)`
- `deleteAccount()` - ใช้ `user.comparePassword(password)`
- `loginAdmin()` - ใช้ `existingAdmin.comparePassword(password)`

### 3. การปรับปรุงเพิ่มเติม:
- เพิ่ม console.log เพื่อ debug
- เพิ่มข้อความภาษาไทย
- ปรับปรุง error handling

## วิธีทดสอบ

### ขั้นตอนที่ 1: ทดสอบการเปลี่ยนรหัสผ่าน
1. ล็อกอินด้วยรหัสผ่านเดิม
2. ไปที่หน้า `/SettingUser`
3. กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่
4. กดบันทึก

### ขั้นตอนที่ 2: ทดสอบการล็อกอินด้วยรหัสผ่านใหม่
1. ล็อกเอาท์
2. ล็อกอินด้วยรหัสผ่านใหม่
3. ตรวจสอบว่าสามารถเข้าสู่ระบบได้

### ขั้นตอนที่ 3: ตรวจสอบ Backend Logs
- ดู console logs เพื่อยืนยันว่าการเปลี่ยนรหัสผ่านสำเร็จ
- ตรวจสอบว่าไม่มี error ใดๆ

## ผลลัพธ์ที่คาดหวัง
- ระบบเปลี่ยนรหัสผ่านสำเร็จ
- สามารถล็อกอินด้วยรหัสผ่านใหม่ได้
- ไม่สามารถล็อกอินด้วยรหัสผ่านเดิมได้อีก

## หมายเหตุ
- การแก้ไขนี้ใช้ comparePassword method ที่มีอยู่ใน User และ Admin models
- วิธีนี้ช่วยให้การเปรียบเทียบรหัสผ่านสอดคล้องกันทั้งระบบ
- ลดความเสี่ยงจากการใช้ bcrypt.compare โดยตรงที่อาจทำให้เกิดปัญหา