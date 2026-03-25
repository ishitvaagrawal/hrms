# 🚀 Deployment Guide: HRMS Management Hub

This guide provides step-by-step instructions for deploying the HRMS Management Hub to **Render** (Backend & Database) and **Vercel** (Frontend).

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Deploy Database (Render PostgreSQL)](#step-1-deploy-database-render-postgresql)
3. [Step 2: Deploy Backend (Render Web Service)](#step-2-deploy-backend-render-web-service)
4. [Step 3: Deploy Frontend (Vercel)](#step-3-deploy-frontend-vercel)
5. [Troubleshooting & Verification](#troubleshooting--verification)

---

## 1. Prerequisites
- A **GitHub** account with your repository pushed.
- A **Render** account ([render.com](https://render.com)).
- A **Vercel** account ([vercel.com](https://vercel.com)).

---

## Step 1: Deploy Database (Render PostgreSQL)
Render provides managed PostgreSQL which is perfect for this project.

1.  **Log in** to your Render Dashboard.
2.  Click **New +** and select **PostgreSQL**.
3.  **Name**: `hrms-db`
4.  **Database**: `hrms_db`
5.  **User**: `hrms_user`
6.  **Region**: Select the region closest to you (e.g., `Oregon (US West)`).
7.  **Plan**: Select **Free** (or your preferred plan).
8.  Click **Create Database**.
9.  **Wait** for the database to be "Available".
10. **Copy** the **Internal Database URL** (e.g., `postgresql://hrms_user:password@hostname:5432/hrms_db`). You will need this for the backend.

---

## Step 2: Deploy Backend (Render Web Service)
The backend is dockerized and will run as a Web Service.

1.  Click **New +** and select **Web Service**.
2.  **Connect your repository** from GitHub.
3.  **Name**: `hrms-backend`
4.  **Region**: Same as your database.
5.  **Root Directory**: Type `backend` (Render will search for the Dockerfile within this subfolder).
6.  **Language**: Select `Docker` from the dropdown.
7.  **Environment Variables**:
    - Scroll down to the **Advanced** section or click the **Environment** tab.
    - Click **Add Environment Variable**.
    - **Variable 1**:
        - Key: `DATABASE_URL`
        - Value: Paste the **Internal Database URL** from Step 1.
        - *Ensure it looks like: `postgresql+psycopg2://user:pass@host:5432/db`*
    - **Variable 2**:
        - Key: `PORT`
        - Value: `10000`
8.  Click **Create Web Service** (or **Save Changes** if already created).
9.  **Verification**: Once deployed, visit `https://hrms-backend.onrender.com/` (use your actual URL). You should see `{"message": "Welcome to HRMS Lite API"}`.

---

## Step 3: Deploy Frontend (Vercel)
The frontend is a Next.js application located in the `frontend` directory.

1.  **Log in** to your Vercel Dashboard.
2.  Click **Add New...** -> **Project**.
3.  **Import** your GitHub repository.
4.  **Configure Project**:
    - **Project Name**: `hrms-management-hub`
    - **Framework Preset**: `Next.js`
    - **Root Directory**: Click the **Edit** button next to the "Root Directory" field and select the `frontend` folder from the tree view.
5.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Your Render Backend URL (e.g., `https://hrms-backend.onrender.com`).
6.  Click **Deploy**.
7.  **Verification**: Once finished, Vercel will provide a URL (e.g., `https://hrms-management-hub.vercel.app`). Open it to see your HRMS Dashboard.

---

## Troubleshooting & Verification

### 1. Database Connection Issues
If the backend logs show "Connection Refused", verify that `DATABASE_URL` is using the **Internal** URL and includes `+psycopg2` (e.g., `postgresql+psycopg2://...`).

### 2. CORS Errors
The backend is currently configured to allow all origins (`allow_origins=["*"]`). For production hardening, you can update `backend/app/main.py` to only allow your Vercel domain.

### 3. API Fetching
If the frontend shows "Failed to fetch", ensure `NEXT_PUBLIC_API_URL` does **not** have a trailing slash (e.g., use `https://api.com` NOT `https://api.com/`).

### 4. WebSocket Updates
The dashboard uses WebSockets. Render's Web Services support WebSockets out-of-the-box. If they fail, check if you are using `https://` (the frontend will automatically use `wss://`).

---

## 🏗️ How to Update your Deployment

If you push new changes to GitHub *after* the initial build has started:

### 1. Automatic Updates (Standard)
Both Render and Vercel are configured by default to **automatically** start a new build whenever you push a change to your connected branch (e.g., `main` or `deploy/production-ready`).

### 2. Manual Update (Render)
If you want to force a re-deploy on Render (e.g., if a build failed or you changed environment variables):
- Go to your Web Service dashboard.
- Click the **Deploy** button (top right).
- Select **Clear Build Cache & Deploy** to ensure a fresh build.

### 3. Manual Update (Vercel)
If you want to re-run a deployment on Vercel:
- Go to the **Deployments** tab.
- Click the three dots `...` next to the latest deployment.
- Select **Redploy**.
