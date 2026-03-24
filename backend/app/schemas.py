from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from app.models import AttendanceStatus
from typing import Optional

class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AttendanceBase(BaseModel):
    attendance_date: datetime
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    employee_id: int

class AttendanceResponse(AttendanceBase):
    id: int
    employee_id: int

    model_config = ConfigDict(from_attributes=True)
