import { Employee, Attendance, AttendanceStatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  // Employees
  async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_URL}/employees/`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> {
    const res = await fetch(`${API_URL}/employees/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    
    if (!res.ok) {
      let errorMessage = 'Failed to create employee';
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Fallback if response is not JSON
        errorMessage = await res.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    return res.json();
  },

  async deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete employee');
  },

  async bulkDeleteEmployees(ids: string[]): Promise<void> {
    const res = await fetch(`${API_URL}/employees/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids),
    });
    if (!res.ok) throw new Error('Failed to delete employees');
  },

  // Attendance
  async markAttendance(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    const res = await fetch(`${API_URL}/attendance/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendance),
    });
    if (!res.ok) throw new Error('Failed to mark attendance');
    return res.json();
  },

  async getAttendanceByEmployee(id: string, skip: number = 0, limit: number = 10): Promise<Attendance[]> {
    const res = await fetch(`${API_URL}/attendance/${id}?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch attendance logs');
    return res.json();
  },

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const res = await fetch(`${API_URL}/attendance/date/${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Failed to fetch attendance by date');
    return res.json();
  },

  async bulkMarkAttendance(data: { 
    employee_ids: string[], 
    attendance_date: string, 
    status: AttendanceStatus 
  }): Promise<Attendance[]> {
    const response = await fetch(`${API_URL}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to mark bulk attendance');
    return response.json();
  },

  async getAttendanceSummary(): Promise<Record<string, { Present: number; Absent: number }>> {
    const response = await fetch(`${API_URL}/attendance/summary`);
    if (!response.ok) throw new Error('Failed to fetch attendance summary');
    return response.json();
  }
};
