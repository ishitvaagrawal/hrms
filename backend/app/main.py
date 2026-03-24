from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import employee_routes, attendance_routes

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(employee_routes.router)
app.include_router(attendance_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to HRMS Lite API"}
