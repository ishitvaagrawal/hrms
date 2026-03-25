from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas import AttendanceCreate, AttendanceResponse, AttendanceBulkCreate
from app.services.attendance_service import attendance_service
from typing import List
from uuid import UUID

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    return attendance_service.mark_attendance(db=db, attendance_data=attendance)

@router.post("/bulk", response_model=List[AttendanceResponse])
def bulk_mark_attendance(bulk_data: AttendanceBulkCreate, db: Session = Depends(get_db)):
    return attendance_service.bulk_mark_attendance(db=db, bulk_data=bulk_data)

@router.get("/date/{date_str}", response_model=List[AttendanceResponse])
def get_attendance_by_date(date_str: str, db: Session = Depends(get_db)):
    try:
        # Parse ISO string
        date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return attendance_service.get_attendance_by_date(db=db, date=date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")

@router.get("/summary")
def get_attendance_summary(db: Session = Depends(get_db)):
    return attendance_service.get_attendance_summary(db=db)

@router.get("/{employee_id}", response_model=List[AttendanceResponse])
def get_attendance(
    employee_id: UUID, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return attendance_service.get_employee_attendance(
        db=db, 
        employee_id=employee_id, 
        skip=skip, 
        limit=limit
    )

@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: UUID, db: Session = Depends(get_db)):
    return attendance_service.delete_attendance(db=db, attendance_id=attendance_id)
