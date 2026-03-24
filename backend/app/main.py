from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine, Base
from app.routes import employee_routes, attendance_routes
from app.core.ws_manager import manager
from typing import List
from fastapi import WebSocket, WebSocketDisconnect
import logging
import json

logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create schema and tables on startup
    with engine.begin() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS app"))
        Base.metadata.create_all(bind=conn)
    yield

app = FastAPI(title="HRMS Lite API", version="1.0.0", lifespan=lifespan)

# Global Exception Handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Database integrity error or invalid data", "error": str(exc)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred", "error": str(exc)},
    )

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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    origin = websocket.headers.get("origin")
    logger.info(f"WebSocket connection attempt from origin: {origin}")
    await manager.connect(websocket)
    try:
        # Send initial welcome message
        await websocket.send_text(json.dumps({"event": "CONNECTED", "message": "Successfully connected"}))
        
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected gracefully")
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
    finally:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"message": "Welcome to HRMS Lite API"}
