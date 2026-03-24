from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.models import Attendance, Employee
from app.schemas import AttendanceCreate
from fastapi import HTTPException, status

class AttendanceService:
    @staticmethod
    def mark_attendance(db: Session, attendance_data: AttendanceCreate):
        # Verify employee exists
        employee = db.get(Employee, attendance_data.employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )

        # Check for duplicate attendance on the same date
        # We simplify to date comparison
        date_only = attendance_data.attendance_date.date()
        existing_attendance = db.scalars(
            select(Attendance).where(
                and_(
                    Attendance.employee_id == attendance_data.employee_id,
                    Attendance.attendance_date == attendance_data.attendance_date
                )
            )
        ).first()

        if existing_attendance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance already marked for this employee on this date"
            )

        new_attendance = Attendance(
            employee_id=attendance_data.employee_id,
            attendance_date=attendance_data.attendance_date,
            status=attendance_data.status
        )
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        return new_attendance

    @staticmethod
    def get_employee_attendance(db: Session, employee_internal_id: int):
        # Verify employee exists
        employee = db.get(Employee, employee_internal_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        return db.scalars(
            select(Attendance).where(Attendance.employee_id == employee_internal_id)
        ).all()

attendance_service = AttendanceService()
