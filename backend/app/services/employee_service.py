from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models import Employee
from app.schemas import EmployeeCreate
from fastapi import HTTPException, status

class EmployeeService:
    @staticmethod
    def create_employee(db: Session, employee_data: EmployeeCreate):
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
        return new_employee

    @staticmethod
    def get_all_employees(db: Session):
        return db.scalars(select(Employee)).all()

    @staticmethod
    def delete_employee(db: Session, employee_id: str):
        employee = db.scalars(select(Employee).where(Employee.employee_id == employee_id)).first()
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        db.delete(employee)
        db.commit()
        return {"detail": "Employee deleted successfully"}

employee_service = EmployeeService()
