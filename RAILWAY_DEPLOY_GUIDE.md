# 🚂 คู่มือ Deploy บน Railway.app

## สิ่งที่เตรียมไว้ให้แล้ว

โค้ดได้ถูกเตรียมพร้อมสำหรับ deploy บน Railway แล้ว:

1. ✅ `frontend/src/config/api.js` - API URL configuration
2. ✅ `frontend/.env` และ `.env.example` - Environment variables
3. ✅ `backend/railway.json` และ `frontend/railway.json` - Railway config
4. ✅ `backend/Procfile` และ `frontend/Procfile` - Process files
5. ✅ แก้ไข hardcoded URLs ในไฟล์หลักๆ แล้ว

---

## ขั้นตอนการ Deploy

### Step 1: Push Code ขึ้น GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: สร้าง Project บน Railway

1. ไปที่ [railway.app](https://railway.app)
2. Login ด้วย GitHub
3. กด **"New Project"**

### Step 3: เพิ่ม MongoDB

1. ใน Project กด **"+ New"** → **"Database"** → **"Add MongoDB"**
2. รอให้ MongoDB พร้อมใช้งาน
3. กดที่ MongoDB → tab **"Variables"** → copy `MONGO_URL`

### Step 4: Deploy Backend

1. กด **"+ New"** → **"GitHub Repo"** → เลือก repo
2. ตั้งค่า:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`

3. เพิ่ม Environment Variables:
```
PORT=3001
NODE_ENV=production
MONGO=${{MongoDB.MONGO_URL}}
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
ADMIN_JWT_SECRET=your-admin-secret-key-make-it-long-and-random
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
ALLOWED_ORIGINS=https://your-frontend.railway.app
```

4. ไปที่ **Settings** → **Networking** → **Generate Domain**
   - จดบันทึก URL ที่ได้ เช่น `backend-xxx.railway.app`

### Step 5: Deploy Frontend

1. กด **"+ New"** → **"GitHub Repo"** → เลือก repo เดิม
2. ตั้งค่า:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s build -l $PORT`

3. เพิ่ม Environment Variables:
```
REACT_APP_API_URL=https://backend-xxx.railway.app
```
(ใส่ URL ของ backend จาก Step 4)

4. ไปที่ **Settings** → **Networking** → **Generate Domain**

### Step 6: อัพเดท CORS

กลับไปที่ Backend → Variables → แก้ไข:
```
ALLOWED_ORIGINS=https://frontend-xxx.railway.app
```
(ใส่ URL ของ frontend จาก Step 5)

---

## Environment Variables ที่ต้องตั้งค่า

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (3001) | ✅ |
| `NODE_ENV` | production | ✅ |
| `MONGO` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT | ✅ |
| `ADMIN_JWT_SECRET` | Secret key for Admin JWT | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `ALLOWED_ORIGINS` | Frontend URL for CORS | ✅ |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | ✅ |

---

## ทดสอบการ Deploy

1. **Backend Health Check:**
   ```
   https://your-backend.railway.app/health
   ```

2. **API Documentation:**
   ```
   https://your-backend.railway.app/api
   ```

3. **Frontend:**
   ```
   https://your-frontend.railway.app
   ```

---

## Troubleshooting

### ปัญหา: CORS Error
- ตรวจสอบว่า `ALLOWED_ORIGINS` ใน backend ตรงกับ URL ของ frontend

### ปัญหา: MongoDB Connection Failed
- ตรวจสอบว่าใช้ `${{MongoDB.MONGO_URL}}` ใน Variables

### ปัญหา: Build Failed
- ดู Logs ใน Railway Dashboard
- ตรวจสอบว่า `package.json` มี scripts ที่ถูกต้อง

### ปัญหา: API ไม่ทำงาน
- ตรวจสอบว่า `REACT_APP_API_URL` ใน frontend ถูกต้อง
- ตรวจสอบว่า backend deploy สำเร็จแล้ว

---

## ค่าใช้จ่าย

Railway ให้ **$5 credit ฟรี** ต่อเดือน ซึ่งเพียงพอสำหรับ:
- 1 Backend service
- 1 Frontend service  
- 1 MongoDB database

สำหรับ production จริงจัง แนะนำ upgrade เป็น Pro plan ($20/เดือน)
