# HRMS Lite

A clean, production-ready Human Resource Management System.

## 🚀 Quick Start (Docker)

Run the full system from the root:
```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## 🐍 Backend Local Development

If you prefer to run the backend locally:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Setup virtual environment:
   ```bash
   # Check if venv exists, if not create it
   python -m venv venv
   ```
3. Activate environment:
   - Mac/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run server:
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 🎨 Frontend Development

The frontend is built with Next.js (App Router) using Tailwind CSS v4.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```