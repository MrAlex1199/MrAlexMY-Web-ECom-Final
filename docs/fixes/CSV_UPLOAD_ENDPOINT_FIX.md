# CSV Upload Endpoint Fix

## ปัญหาที่พบ
```
Error: Not Found - /api/upload-csv-products
POST /api/upload-csv-products 404
```

Frontend เรียก endpoint ที่ไม่ถูกต้อง สำหรับการอัปโหลด CSV และรูปภาพ

## สาเหตุของปัญหา

### Endpoint Mismatch
- **Frontend เรียก**: `/api/upload-csv-products`
- **Backend มี**: `/api/products/upload-csv`

- **Frontend เรียก**: `/api/upload-images`  
- **Backend มี**: `/api/products/upload-images`

## การแก้ไข

### 1. แก้ไข AdminProducts.jsx

#### CSV Upload Endpoint
```javascript
// เปลี่ยนจาก
await axios.post("http://localhost:3001/api/upload-csv-products", formData, { headers });

// เป็น
await axios.post("http://localhost:3001/api/products/upload-csv", formData, { headers });
```

#### Image Upload Endpoint
```javascript
// เปลี่ยนจาก
const response = await axios.post("http://localhost:3001/api/upload-images", formData, { headers });

// เป็น
const response = await axios.post("http://localhost:3001/api/products/upload-images", formData, { headers });
```

## Backend Routes Verification

### Product Routes (`/api/products/`)
```javascript
// File upload routes (Admin only)
router.post('/upload-images', authenticateAdmin, upload.array("images", 10), uploadImages);
router.post('/upload-csv', authenticateAdmin, upload.single("file"), uploadCSVProducts);
```

### Controller Functions
- ✅ `uploadCSVProducts` - มีอยู่และทำงานถูกต้อง
- ✅ `uploadImages` - มีอยู่และทำงานถูกต้อง

## CSV Upload Function Features

### uploadCSVProducts
- รองรับ CSV format ที่ครบถ้วน
- Validation สำหรับ required fields
- Error handling สำหรับ invalid data
- Bulk insert ด้วย `Product.insertMany()`
- Auto cleanup uploaded files
- Thai language error messages

### Required CSV Columns
- `name` - ชื่อสินค้า (required)
- `price` - ราคา (required, รองรับ $)
- `stock_remaining` - จำนวนคงเหลือ (required)
- `imageSrc` - รูปภาพหลัก (required)
- `href` - ลิงก์สินค้า (optional)
- `imageAlt` - Alt text รูปภาพ (optional)
- `breadcrumbs` - เส้นทางหมวดหมู่ (optional)
- `images` - รูปภาพเพิ่มเติม (optional, format: "src > alt | src > alt")
- `colors` - สีสินค้า (optional, format: "name > class > selectedClass | ...")
- `sizes` - ขนาดสินค้า (optional, format: "name > true/false | ...")
- `description` - คำอธิบาย (optional)
- `highlights` - จุดเด่น (optional, format: "highlight1 | highlight2")
- `details` - รายละเอียด (optional)
- `discount` - ส่วนลด % (optional)
- `reviewsAverage` - คะแนนรีวิว (optional)
- `reviewsTotal` - จำนวนรีวิว (optional)
- `reviewLink` - ลิงก์รีวิว (optional)

## การทดสอบ

### Test CSV Upload
1. เข้าสู่ Admin Products page
2. เลือกไฟล์ CSV ที่มี format ถูกต้อง
3. คลิก "อัปโหลด CSV"
4. ตรวจสอบ response และข้อมูลในฐานข้อมูล

### Test Image Upload
1. เข้าสู่ Admin Products page
2. เลือกรูปภาพหลายไฟล์
3. คลิก "อัปโหลดรูปภาพ"
4. ตรวจสอบ response และรูปภาพใน Cloudinary

## Status: FIXED ✅

การแก้ไข endpoint สำเร็จแล้ว:
- ✅ CSV upload endpoint: `/api/products/upload-csv`
- ✅ Image upload endpoint: `/api/products/upload-images`
- ✅ Backend routes และ controllers พร้อมใช้งาน
- ✅ Authentication middleware ทำงานถูกต้อง
- ✅ File validation และ error handling

## หมายเหตุ

หลังจากแก้ไข frontend แล้ว อาจจะต้อง:
1. Clear browser cache
2. Reload หน้าเว็บ
3. ทดสอบการอัปโหลดใหม่

ระบบอัปโหลด CSV และรูปภาพพร้อมใช้งานแล้ว!