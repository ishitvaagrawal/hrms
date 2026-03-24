from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AttendanceCreate, AttendanceResponse
from app.services.attendance_service import attendance_service
from typing import List

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse)
def mark_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    return attendance_service.mark_attendance(db=db, attendance_data=attendance)

@router.get("/{employee_id}", response_model=List[AttendanceResponse])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    return attendance_service.get_employee_attendance(db=db, employee_internal_id=employee_id)
