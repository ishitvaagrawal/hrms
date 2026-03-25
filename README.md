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

The system is optimized for high-performance cloud hosting. For a comprehensive, step-by-step guide on how to deploy the Backend to **Render** and the Frontend to **Vercel**, please refer to our:

👉 **[Detailed Deployment Guide](docs/deployment_guide.md)**

### Quick Overview:
- **Frontend**: Next.js 15 on **Vercel**.
- **Backend**: Dockerized FastAPI on **Render**.
- **Database**: Managed PostgreSQL on **Render**.

---

## 🌐 Live URLs

*   **Frontend**: `https://hrms-management-hub.vercel.app` (Example)
*   **Backend**: `https://hrms-lite-api.onrender.com` (Example)

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