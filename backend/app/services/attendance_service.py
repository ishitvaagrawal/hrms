from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from sqlalchemy.exc import SQLAlchemyError
from app.models import Attendance, Employee
from app.schemas import AttendanceCreate, AttendanceBulkCreate
from fastapi import HTTPException, status
from uuid import UUID

class AttendanceService:
    @staticmethod
    def mark_attendance(db: Session, attendance_data: AttendanceCreate):
        try:
            # Verify employee exists
            employee = db.get(Employee, attendance_data.employee_id)
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found"
                )

            # Check for duplicate attendance on the same date
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
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while marking attendance: {str(e)}"
            )
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {str(e)}"
            )

    @staticmethod
    def get_employee_attendance(db: Session, employee_internal_id: UUID, skip: int = 0, limit: int = 100):
        try:
            # Verify employee exists
            employee = db.get(Employee, employee_internal_id)
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found"
                )
            
            return db.scalars(
                select(Attendance)
                .where(Attendance.employee_id == employee_internal_id)
                .order_by(Attendance.attendance_date.desc())
                .offset(skip)
                .limit(limit)
            ).all()
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while fetching attendance: {str(e)}"
            )

    @staticmethod
    def delete_attendance(db: Session, attendance_id: UUID):
        try:
            attendance = db.get(Attendance, attendance_id)
            if not attendance:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance record not found"
                )
            # Hard Delete
            db.delete(attendance)
            db.commit()
            return {"detail": "Attendance record deleted successfully (hard-delete)"}
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while deleting attendance: {str(e)}"
            )

    @staticmethod
    def bulk_mark_attendance(db: Session, bulk_data: AttendanceBulkCreate):
        try:
            results = []
            for emp_id in bulk_data.employee_ids:
                # Verify employee exists
                employee = db.get(Employee, emp_id)
                if not employee:
                    continue # Skip if employee doesn't exist

                # Format date to normalize (discard time if needed, but the model handles DateTime)
                # However, for uniqueness, we should probably normalize to date if it's meant to be daily.
                # The model uses DateTime.
                
                # Check for existing attendance
                existing = db.scalars(
                    select(Attendance).where(
                        and_(
                            Attendance.employee_id == emp_id,
                            Attendance.attendance_date == bulk_data.attendance_date
                        )
                    )
                ).first()

                if existing:
                    # Update status if already exists
                    existing.status = bulk_data.status
                    results.append(existing)
                else:
                    # Create new
                    new_attendance = Attendance(
                        employee_id=emp_id,
                        attendance_date=bulk_data.attendance_date,
                        status=bulk_data.status
                    )
                    db.add(new_attendance)
                    results.append(new_attendance)
            
            db.commit()
            for r in results:
                db.refresh(r)
            return results
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error during bulk attendance marking: {str(e)}"
            )

    @staticmethod
    def get_attendance_by_date(db: Session, date: datetime):
        try:
            # Normalize date to start of day for broader matching if needed, 
            # but here we follow the exact match pattern.
            return db.scalars(
                select(Attendance).where(Attendance.attendance_date == date)
            ).all()
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while fetching attendance by date: {str(e)}"
            )

    @staticmethod
    def get_attendance_summary(db: Session):
        from sqlalchemy import func
        try:
            # Query results: employee_id, status, count
            summary_query = db.execute(
                select(
                    Attendance.employee_id,
                    Attendance.status,
                    func.count(Attendance.id).label('count')
                ).group_by(Attendance.employee_id, Attendance.status)
            ).all()
            
            # Format into {employee_id: {Present: X, Absent: Y}}
            results = {}
            for row in summary_query:
                emp_id = str(row.employee_id)
                if emp_id not in results:
                    results[emp_id] = {"Present": 0, "Absent": 0}
                results[emp_id][row.status] = row.count
                
            return results
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while fetching attendance summary: {str(e)}"
            )

attendance_service = AttendanceService()
