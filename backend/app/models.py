import uuid
from uuid import UUID
from enum import Enum
from sqlalchemy import String, Integer, ForeignKey, Column, DateTime, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime

# Set the default schema for all tables
Base.metadata.schema = "app"

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    department: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    attendances: Mapped[list["Attendance"]] = relationship(back_populates="employee", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendances"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[UUID] = mapped_column(ForeignKey("employees.id"), nullable=False)
    attendance_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[AttendanceStatus] = mapped_column(SQLEnum(AttendanceStatus), nullable=False)
    employee: Mapped["Employee"] = relationship(back_populates="attendances")

    __table_args__ = (
        UniqueConstraint("employee_id", "attendance_date", name="ui_employee_attendance_date"),
    )
