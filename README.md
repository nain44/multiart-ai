# MultiArt AI 🖼️
**A full-stack wallpaper platform** — backend API, admin panel, public website, and mobile app.

---

## Project Structure

```
MultiArt AI/
├── backend/    ← Node.js + Express REST API
├── admin/      ← Next.js admin panel (port 3001)
├── website/    ← Next.js public website (port 3000)
└── mobile/     ← React Native + Expo (coming soon)
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env     # Fill in your credentials
npm install
npm run dev              # Runs on http://localhost:5000
```

**Required .env values:**
- `MONGODB_URI` — get from [MongoDB Atlas](https://cloud.mongodb.com) (free)
- `JWT_SECRET` — any random 32+ char string
- `CLOUDINARY_*` — get from [Cloudinary Dashboard](https://cloudinary.com) (free)

**First time only — create your admin account:**
```bash
curl -X POST http://localhost:5000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword","name":"Admin"}'
```

### 2. Admin Panel

```bash
cd admin
cp .env.example .env.local   # Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                  # Runs on http://localhost:3001
```
Open [http://localhost:3001](http://localhost:3001) and log in.

### 3. Public Website

```bash
cd website
cp .env.example .env.local   # Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                  # Runs on http://localhost:3000
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/wallpapers` | Paginated wallpaper list |
| GET | `/api/wallpapers/featured` | Top 12 by downloads |
| GET | `/api/wallpapers/random` | 1 random free wallpaper |
| GET | `/api/wallpapers/:id` | Single wallpaper |
| POST | `/api/wallpapers/:id/download` | Track download |
| GET | `/api/categories` | All categories |
| POST | `/api/auth/login` | Admin login → JWT |
| POST | `/api/auth/setup` | One-time admin setup |
| POST | `/api/wallpapers` | Upload wallpaper (admin) |
| PUT | `/api/wallpapers/:id` | Update wallpaper (admin) |
| DELETE | `/api/wallpapers/:id` | Delete wallpaper (admin) |
| POST | `/api/categories` | Create category (admin) |

---

## Deployment

| Service | Platform | Cost |
|---|---|---|
| Backend | Railway / Render | Free tier |
| Admin Panel | Vercel | Free |
| Website | Vercel | Free |
| Database | MongoDB Atlas | Free (512 MB) |
| Images | Cloudinary | Free (25 GB) |
