from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from app.models import Employee
from app.schemas import EmployeeCreate
from fastapi import HTTPException, status
from app.core.ws_manager import manager

class EmployeeService:
    """
    Handle business logic for Employee management including CRUD operations
    and real-time WebSocket notifications.
    """
    @staticmethod
    async def create_employee(db: Session, employee_data: EmployeeCreate):
        """Register a new employee and broadcast the update."""
        try:
            # Validate unique employee_id
            existing_id = db.scalars(select(Employee).where(Employee.employee_id == employee_data.employee_id)).first()
            if existing_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An employee with this ID already exists."
                )
            
            # Validate unique email
            existing_email = db.scalars(select(Employee).where(Employee.email == employee_data.email)).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An employee with this email already exists."
                )

            new_employee = Employee(
                employee_id=employee_data.employee_id,
                full_name=employee_data.full_name,
                email=employee_data.email,
                department=employee_data.department
            )
            db.add(new_employee)
            db.commit()
            db.refresh(new_employee)
            
            # Notify connected clients
            await manager.broadcast({
                "event": "EMPLOYEES_UPDATED", 
                "action": "create", 
                "id": str(new_employee.id)
            })
            
            return new_employee
        except SQLAlchemyError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database synchronization failed: {str(err)}"
            )

    @staticmethod
    def get_all_employees(db: Session):
        """Retrieve all registered employees."""
        try:
            return db.scalars(select(Employee)).all()
        except SQLAlchemyError as err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch employee records: {str(err)}"
            )

    @staticmethod
    async def delete_employee(db: Session, id: UUID):
        """Remove an employee and their associated data."""
        try:
            employee = db.scalars(select(Employee).where(Employee.id == id)).first()
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee profile not found."
                )
            
            db.delete(employee)
            db.commit()
            
            # Notify connected clients
            await manager.broadcast({
                "event": "EMPLOYEES_UPDATED", 
                "action": "delete", 
                "id": str(id)
            })
            
            return {"detail": "Employee deleted successfully"}
        except SQLAlchemyError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete employee record: {str(err)}"
            )

    @staticmethod
    async def bulk_delete_employees(db: Session, ids: list[UUID]):
        """Perform batch deletion of multiple employee profiles."""
        try:
            employees = db.scalars(select(Employee).where(Employee.id.in_(ids))).all()
            if not employees:
                return {"detail": "No matching employee records found for deletion.", "deleted_count": 0}
            
            deleted_count = len(employees)
            for employee in employees:
                db.delete(employee)
            
            db.commit()

            # Notify connected clients
            await manager.broadcast({
                "event": "EMPLOYEES_UPDATED", 
                "action": "bulk_delete", 
                "ids": [str(id_) for id_ in ids]
            })

            return {
                "detail": f"Successfully removed {deleted_count} employee profiles.", 
                "deleted_count": deleted_count
            }
        except SQLAlchemyError as err:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Bulk deletion failed: {str(err)}"
            )

employee_service = EmployeeService()
