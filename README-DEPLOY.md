# 🚀 Deployment Guide - Admin Frontend

## สำหรับ Coolify Deployment

### ขั้นตอนการ Deploy

#### 1. เตรียม Repository
Repository URL: `https://github.com/choommanee/bet-fe-adminv2`

#### 2. ตั้งค่าใน Coolify

**General Settings:**
- **Source**: GitHub Repository
- **Repository**: `https://github.com/choommanee/bet-fe-adminv2`
- **Branch**: `master`
- **Build Pack**: Dockerfile

**Environment Variables (Build Args):**
```bash
VITE_API_URL=https://api.bicycle789.com
VITE_API_BASE_PATH=/api/v1
```

**Port Configuration:**
- **Container Port**: `80`
- **Public Port**: ตามที่ต้องการ (เช่น 3001)

**Health Check:**
- **Path**: `/`
- **Port**: `80`
- **Interval**: `30s`

#### 3. Build Arguments

Dockerfile รองรับ build arguments ดังนี้:
- `VITE_API_URL` - URL ของ Backend API (default: https://api.bicycle789.com)
- `VITE_API_BASE_PATH` - Base path ของ API (default: /api/v1)

#### 4. Deploy Commands

Coolify จะทำการ build และ deploy โดยอัตโนมัติโดยใช้ Dockerfile

---

## การทดสอบ Local ด้วย Docker

### 1. Build Image
```bash
docker build -t bet-admin \
  --build-arg VITE_API_URL=https://api.bicycle789.com \
  --build-arg VITE_API_BASE_PATH=/api/v1 \
  .
```

### 2. Run Container
```bash
docker run -d \
  --name bet-admin \
  -p 3001:80 \
  bet-admin
```

### 3. ใช้ Docker Compose
```bash
# สร้างไฟล์ .env และกำหนดค่า
VITE_API_URL=https://api.bicycle789.com
VITE_API_BASE_PATH=/api/v1

# Run
docker-compose up -d

# Stop
docker-compose down
```

---

## การตั้งค่า Environment Variables

### Build Time Variables (ใช้ใน Dockerfile)
ตัวแปรเหล่านี้ต้องกำหนดตอน build:

```bash
VITE_API_URL=https://api.bicycle789.com
VITE_API_BASE_PATH=/api/v1
```

### วิธีกำหนดค่าใน Coolify

1. ไปที่ **Settings** → **Environment Variables**
2. เลือก **Build Args**
3. เพิ่มตัวแปร:
   - Key: `VITE_API_URL`, Value: `https://api.bicycle789.com`
   - Key: `VITE_API_BASE_PATH`, Value: `/api/v1`

---

## โครงสร้างไฟล์สำคัญ

```
bet-fe-adminv2/
├── Dockerfile              # Multi-stage build (Node + Nginx)
├── nginx.conf             # Nginx configuration
├── docker-compose.yml     # สำหรับทดสอบ local
├── .dockerignore          # ไฟล์ที่ไม่ต้อง copy เข้า Docker
├── .env.example           # ตัวอย่างการตั้งค่า environment
├── package.json           # Dependencies
└── src/                   # Source code
```

---

## Nginx Configuration

ระบบใช้ Nginx เป็น web server โดยมีการตั้งค่า:

✅ SPA Routing (React Router)
✅ Gzip Compression
✅ Static Asset Caching (1 year)
✅ Security Headers
✅ Health Check Endpoint

---

## การตรวจสอบหลัง Deploy

### 1. Health Check
```bash
curl http://your-domain/
```

### 2. ตรวจสอบ API Connection
เปิด Browser Console และดูว่า API calls ไปที่ URL ที่ถูกต้อง

### 3. ตรวจสอบ Build Args
```bash
# ดู environment variables ที่ถูก build เข้าไป
docker exec -it <container-name> cat /usr/share/nginx/html/assets/index-*.js | grep -o 'https://api[^"]*'
```

---

## Troubleshooting

### ปัญหา: API Connection Failed
**แก้ไข**: ตรวจสอบ `VITE_API_URL` และ `VITE_API_BASE_PATH` ว่าตั้งค่าถูกต้อง

### ปัญหา: 404 on Page Refresh
**แก้ไข**: ตรวจสอบ nginx.conf ว่ามี `try_files $uri $uri/ /index.html;`

### ปัญหา: Build Failed
**แก้ไข**:
1. ตรวจสอบ Node version (ต้อง 20+)
2. ตรวจสอบ dependencies ใน package.json
3. Run `npm install --legacy-peer-deps`

---

## การอัพเดทแอพ

### Auto Deploy (Recommended)
ตั้งค่า Webhook ใน Coolify เพื่อ auto deploy เมื่อมี push ใหม่

### Manual Deploy
1. Push code ไปยัง GitHub
2. ไปที่ Coolify Dashboard
3. กด **Redeploy**

---

## Performance Tips

1. **Enable CDN** - ใช้ Cloudflare หรือ CDN อื่นๆ
2. **Browser Caching** - Nginx config รองรับอยู่แล้ว
3. **Gzip Compression** - เปิดใช้งานอยู่แล้ว
4. **Image Optimization** - ควร optimize images ก่อน deploy

---

## Security Checklist

✅ Environment variables ไม่ถูก commit (.env ใน .gitignore)
✅ Security headers (X-Frame-Options, X-Content-Type-Options)
✅ HTTPS enabled (ตั้งค่าใน Coolify)
✅ Regular updates (dependencies)

---

## Support

หากมีปัญหาในการ deploy:
1. ตรวจสอบ logs ใน Coolify
2. ทดสอบ build local ด้วย Docker
3. ตรวจสอบ environment variables

---

**Repository**: https://github.com/choommanee/bet-fe-adminv2
**Last Updated**: 2024-11-12
