from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from app.models import Employee
from app.schemas import EmployeeCreate
from fastapi import HTTPException, status
from app.core.ws_manager import manager

class EmployeeService:
    @staticmethod
    async def create_employee(db: Session, employee_data: EmployeeCreate):
        try:
            # Check if employee_id already exists
            existing_id = db.scalars(select(Employee).where(Employee.employee_id == employee_data.employee_id)).first()
            if existing_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Employee ID already exists"
                )
            
            # Check if email already exists
            existing_email = db.scalars(select(Employee).where(Employee.email == employee_data.email)).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
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
            
            # Broadcast update
            await manager.broadcast({"event": "EMPLOYEES_UPDATED", "action": "create", "id": str(new_employee.id)})
            
            return new_employee
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while creating employee: {str(e)}"
            )

    @staticmethod
    def get_all_employees(db: Session):
        try:
            return db.scalars(select(Employee)).all()
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while fetching employees: {str(e)}"
            )
    @staticmethod
    async def delete_employee(db: Session, id: UUID):
        try:
            employee = db.scalars(select(Employee).where(Employee.id == id)).first()
            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found"
                )
            # Hard Delete
            db.delete(employee)
            db.commit()
            
            # Broadcast update
            await manager.broadcast({"event": "EMPLOYEES_UPDATED", "action": "delete", "id": str(id)})
            
            return {"detail": "Employee deleted successfully"}
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while deleting employee: {str(e)}"
            )

    @staticmethod
    async def bulk_delete_employees(db: Session, ids: list[UUID]):
        try:
            # Check if all employees exist or just delete existing ones?
            # Standard approach: delete what matches.
            employees = db.scalars(select(Employee).where(Employee.id.in_(ids))).all()
            if not employees:
                return {"detail": "No employees found to delete", "deleted_count": 0}
            
            count = len(employees)
            for emp in employees:
                db.delete(emp)
            
            db.commit()

            # Broadcast update
            await manager.broadcast({"event": "EMPLOYEES_UPDATED", "action": "bulk_delete", "ids": [str(id_) for id_ in ids]})

            return {"detail": f"Successfully deleted {count} employees", "deleted_count": count}
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error during bulk deletion: {str(e)}"
            )

employee_service = EmployeeService()

employee_service = EmployeeService()
