from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func

class AttendanceService:
    """
    Handle business logic for Attendance tracking, summaries, and bulk operations.
    """
    @staticmethod
    def mark_attendance(db: Session, attendance_data: AttendanceCreate):
        """Record attendance for an employee. Ensures unique daily entry per employee."""
        try:
            # Validate employee existence
            employee = db.get(Employee, attendance_data.employee_id)
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee profile not found."
                )

            # Enforce unique daily attendance constraint
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
                    detail="Attendance has already been recorded for this employee on the selected date."
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
        except SQLAlchemyError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to record attendance: {str(err)}"
            )

    @staticmethod
    def get_employee_attendance(db: Session, employee_id: UUID, skip: int = 0, limit: int = 100):
        """Fetch paginated attendance history for a specific employee."""
        try:
            employee = db.get(Employee, employee_id)
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee profile not found."
                )
            
            return db.scalars(
                select(Attendance)
                .where(Attendance.employee_id == employee_id)
                .order_by(Attendance.attendance_date.desc())
                .offset(skip)
                .limit(limit)
            ).all()
        except SQLAlchemyError as err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve attendance history: {str(err)}"
            )

    @staticmethod
    def delete_attendance(db: Session, attendance_id: UUID):
        """Hard-delete an individual attendance record."""
        try:
            attendance = db.get(Attendance, attendance_id)
            if not attendance:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attendance record not found."
                )
            
            db.delete(attendance)
            db.commit()
            return {"detail": "Attendance record successfully removed."}
        except SQLAlchemyError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to remove attendance record: {str(err)}"
            )

    @staticmethod
    def bulk_mark_attendance(db: Session, bulk_data: AttendanceBulkCreate):
        """Perform batch update/creation of attendance for multiple employees."""
        try:
            processed_records = []
            for employee_id in bulk_data.employee_ids:
                # Validate employee existence
                employee = db.get(Employee, employee_id)
                if not employee:
                    continue 

                # Check for existing entry to decide between Update or Create
                existing_record = db.scalars(
                    select(Attendance).where(
                        and_(
                            Attendance.employee_id == employee_id,
                            Attendance.attendance_date == bulk_data.attendance_date
                        )
                    )
                ).first()

                if existing_record:
                    existing_record.status = bulk_data.status
                    processed_records.append(existing_record)
                else:
                    new_record = Attendance(
                        employee_id=employee_id,
                        attendance_date=bulk_data.attendance_date,
                        status=bulk_data.status
                    )
                    db.add(new_record)
                    processed_records.append(new_record)
            
            db.commit()
            for record in processed_records:
                db.refresh(record)
            return processed_records
        except SQLAlchemyError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Batch attendance operation failed: {str(err)}"
            )

    @staticmethod
    def get_attendance_by_date(db: Session, date: datetime):
        """Retrieve all attendance records for a specific date."""
        try:
            return db.scalars(
                select(Attendance).where(Attendance.attendance_date == date)
            ).all()
        except SQLAlchemyError as err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch attendance for {date.date()}: {str(err)}"
            )

    @staticmethod
    def get_attendance_summary(db: Session):
        """Generate a global summary of Present/Absent counts per employee."""
        try:
            summary_query = db.execute(
                select(
                    Attendance.employee_id,
                    Attendance.status,
                    func.count(Attendance.id).label('count')
                ).group_by(Attendance.employee_id, Attendance.status)
            ).all()
            
            summary_map = {}
            for row in summary_query:
                employee_key = str(row.employee_id)
                if employee_key not in summary_map:
                    summary_map[employee_key] = {"Present": 0, "Absent": 0}
                summary_map[employee_key][row.status] = row.count
                
            return summary_map
        except SQLAlchemyError as err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate attendance summary: {str(err)}"
            )

attendance_service = AttendanceService()
