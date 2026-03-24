from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import datetime
from app.models import AttendanceStatus
from typing import Optional
from uuid import UUID

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=3, max_length=50, pattern=r"^[A-Z0-9-]+$")
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=2, max_length=50)

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AttendanceBase(BaseModel):
    attendance_date: datetime
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    employee_id: UUID

class AttendanceBulkCreate(BaseModel):
    employee_ids: list[UUID]
    attendance_date: datetime
    status: AttendanceStatus

class AttendanceResponse(AttendanceBase):
    id: UUID
    employee_id: UUID

    model_config = ConfigDict(from_attributes=True)
