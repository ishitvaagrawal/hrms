from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import EmployeeCreate, EmployeeResponse
from app.services.employee_service import employee_service
from typing import List

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/", response_model=EmployeeResponse)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    return employee_service.create_employee(db=db, employee_data=employee)

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)):
    return employee_service.get_all_employees(db=db)

@router.delete("/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    return employee_service.delete_employee(db=db, employee_id=employee_id)
