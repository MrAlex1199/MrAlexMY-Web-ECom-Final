# Admin Session Persistence Fix

## ปัญหาที่พบ
เมื่อ Admin ล็อกอินสำเร็จแล้ว reload หน้าเว็บ จะต้องล็อกอินใหม่ทุกครั้ง

## สาเหตุของปัญหา

### 1. Frontend Issues
- `App.js` ใช้ endpoint เก่า `/admin` แทน `/api/auth/admin`
- ไม่ได้ตรวจสอบ token ที่เก็บใน localStorage อย่างถูกต้อง
- การจัดการ state ไม่สอดคล้องกัน

### 2. Backend Issues  
- `getAdminData` function ส่งข้อมูลไม่ครบถ้วน (ขาด masterID, permissions)
- ใช้ field เก่า `employeeID` แทน `masterID`
- ไม่รองรับการล็อกอินด้วย Master ID

## การแก้ไข

### 1. Frontend Fixes

#### App.js
```javascript
// เปลี่ยนจาก
const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");

// เป็น
const [isAdmin, setIsAdmin] = useState(false);

// อัปเดต fetchAdminDetails
const fetchAdminDetails = async () => {
  const Atoken = localStorage.getItem("AToken");
  const isAdminStored = localStorage.getItem("isAdmin") === "true";
  
  if (!Atoken || !isAdminStored) {
    // Clear invalid state
    setIsAdmin(false);
    setAdminData(null);
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("AToken");
    return;
  }
  
  try {
    const response = await fetch("http://localhost:3001/api/auth/admin", {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${Atoken}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const data = await response.json();
    if (data.success) {
      setAdminData(data.admin || data);
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
    } else {
      // Clear invalid state
      setIsAdmin(false);
      setAdminData(null);
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("AToken");
    }
  } catch (error) {
    console.error("Error fetching admin details:", error);
    // Clear invalid state on error
    setIsAdmin(false);
    setAdminData(null);
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("AToken");
  }
};
```

#### AdminLogin.jsx
- เพิ่ม toast notifications
- ปรับปรุง error handling
- รองรับการล็อกอินด้วย Master ID
- เพิ่ม loading state

### 2. Backend Fixes

#### authController.js

##### getAdminData Function
```javascript
export const getAdminData = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลแอดมิน" });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        masterID: admin.masterID,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        permissions: admin.permissions,
        roleLevel: admin.getRoleLevel(),
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error(chalk.red('Get admin data error:', error));
    next(error);
  }
};
```

##### loginAdmin Function - รองรับ Master ID
```javascript
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Try to find admin by email first, then by Master ID
    let existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!existingAdmin) {
      // If not found by email, try Master ID
      existingAdmin = await Admin.findOne({ masterID: email.toUpperCase() });
    }

    if (!existingAdmin) {
      return res.status(401).json({ success: false, message: "อีเมลหรือ Master ID ไม่ถูกต้อง" });
    }

    // Check if admin is active
    if (!existingAdmin.isActive) {
      return res.status(401).json({ success: false, message: "บัญชีถูกระงับการใช้งาน" });
    }

    const isMatch = await existingAdmin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // Update last login
    existingAdmin.lastLogin = new Date();
    await existingAdmin.save();

    const adminPayload = { 
      id: existingAdmin._id, 
      email: existingAdmin.email, 
      role: existingAdmin.role,
      masterID: existingAdmin.masterID,
      permissions: existingAdmin.permissions
    };
    const token = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      admin: {
        id: existingAdmin._id,
        email: existingAdmin.email,
        firstName: existingAdmin.firstName,
        lastName: existingAdmin.lastName,
        masterID: existingAdmin.masterID,
        role: existingAdmin.role,
        permissions: existingAdmin.permissions,
        roleLevel: existingAdmin.getRoleLevel()
      }
    });
  } catch (error) {
    console.error(chalk.red('Admin login error:', error));
    next(error);
  }
};
```

## Features เพิ่มเติม

### 1. Master ID Login Support
- สามารถล็อกอินด้วย Master ID แทน email ได้
- ระบบจะค้นหาจาก email ก่อน ถ้าไม่เจอจะค้นหาจาก Master ID

### 2. Enhanced Security
- ตรวจสอบสถานะ `isActive` ของ admin
- Clear localStorage เมื่อ token ไม่ถูกต้อง
- Error handling ที่ดีขึ้น

### 3. Better UX
- Toast notifications แทน alert
- Loading states
- Thai language support
- Better error messages

## การทดสอบ

### Test Accounts
```
Master Admin:
- Email: erogun@admin.com
- Master ID: EROGUN  
- Password: ErogunMaster123

Seller:
- Email: ed3m1a@seller.com
- Master ID: ED3M1A
- Password: Seller123456
```

### Test Cases
1. ✅ ล็อกอินด้วย email
2. ✅ ล็อกอินด้วย Master ID
3. ✅ Reload หน้าเว็บหลังล็อกอิน (session persist)
4. ✅ Token expiration handling
5. ✅ Invalid token handling
6. ✅ Inactive admin handling

## Status: COMPLETE ✅

ปัญหา session persistence ได้รับการแก้ไขแล้ว:
- ✅ Admin สามารถ reload หน้าเว็บโดยไม่ต้องล็อกอินใหม่
- ✅ รองรับการล็อกอินด้วย Master ID
- ✅ Error handling และ UX ที่ดีขึ้น
- ✅ Security improvements
- ✅ Thai language support