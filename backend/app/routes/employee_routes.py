from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import EmployeeCreate, EmployeeResponse
from app.services.employee_service import employee_service
from typing import List
from uuid import UUID

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    return await employee_service.create_employee(db=db, employee_data=employee)

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)):
    return employee_service.get_all_employees(db=db)

@router.delete("/{id}")
async def delete_employee(id: UUID, db: Session = Depends(get_db)):
    return await employee_service.delete_employee(db=db, id=id)

@router.post("/bulk-delete")
async def bulk_delete_employees(ids: List[UUID], db: Session = Depends(get_db)):
    return await employee_service.bulk_delete_employees(db=db, ids=ids)
