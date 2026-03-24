export type Department = {
  id: string;
  name: string;
  employeeCount: number;
};

export type Employee = {
  id: string;          // UUID (primary key)
  employee_id: string; // Business ID (e.g. EMP001)
  full_name: string;
  email: string;
  department: string;
  created_at?: string;
};

export type AttendanceStatus = 'Present' | 'Absent';

export type Attendance = {
  id: string;
  employee_id: string; // Internal UUID
  attendance_date: string;
  status: AttendanceStatus;
  employeeName?: string; // Optional helper for UI
};

export type Severity = 'critical' | 'warning' | 'healthy';
