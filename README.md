# Management Hub - Production-Ready HRMS

A high-performance, professional-grade Human Resource Management System (HRMS) built with **Next.js 15**, **FastAPI**, and **PostgreSQL**.

## ✨ Key Features

- **Consolidated Dashboard**: Single-page management of employees and departments.
- **Attendance Intelligence**: Real-time marking (individual & bulk) with comprehensive history tracking.
- **Modern UI/UX**: Responsive design with skeleton loaders, premium animations, and dark-mode compatibility.
- **Robust Validation**: Full-stack data integrity using Zod (Frontend) and Pydantic v2 (Backend).
- **Real-time Updates**: Live dashboard synchronization via WebSockets.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.13), SQLAlchemy 2.0, PostgreSQL.
- **Orchestration**: Docker & Docker Compose.

---

## 🚀 Deployment

The system is optimized for high-performance cloud hosting:

### 1. 🎨 Frontend (Vercel)
1.  Connect your repository to **Vercel**.
2.  Set the **Root Directory** to `frontend`.
3.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://api.your-hub.com`).

### 2. ⚙️ Backend (Render)
1.  Create a new **Web Service** on Render and connect your repository.
2.  **Environment**: `Python 3`.
3.  **Build Command**: `pip install -r requirements.txt`.
4.  **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
5.  **Environment Variables**:
    - `DATABASE_URL`: Your Render PostgreSQL connection string.

### 3. 🛡️ Database (Render PostgreSQL)
1.  Create a new **PostgreSQL** instance on Render.
    - Ensure it's in the same region as your Web Service for low latency.

---

## 🏗️ Local Development

### 1. Docker (Recommended)
```bash
docker-compose up -d --build
```

### 2. Manual Setup
**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

## 📁 Project Structure
- `frontend/`: Next.js application & modular UI components.
- `backend/`: FastAPI application & SQLAlchemy business layers.
- `docker-compose.yml`: Local orchestration.

---
**Production Note**: All critical build configurations (`eslint`, `postcss`) are included in Git to ensure seamless Vercel/Render deployments.