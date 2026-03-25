import React, { useState } from 'react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Employee, Attendance } from '@/types';

interface AttendanceFormProps {
  employees: Employee[];
  onSubmit: (attendance: Omit<Attendance, 'id'>) => Promise<void>;
  onEmployeeSelect: (id: string) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ employees, onSubmit, onEmployeeSelect }) => {
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const attendanceData = {
      employee_id: formData.get('employeeId') as string,
      attendance_date: formData.get('attendance_date') as string,
      status: formData.get('status') as Attendance['status'],
    };

    try {
      await onSubmit(attendanceData);
      form.reset();
      setSuccess('Attendance marked successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
         <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-600 text-sm font-medium">
           {error}
         </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-green-600 text-sm font-medium">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Select 
          name="employeeId"
          label="Select Employee" 
          required
          onChange={(e) => onEmployeeSelect(e.target.value)}
          options={employees.map(emp => ({ value: emp.id, label: emp.full_name }))}
        />
        <Input name="attendance_date" label="Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
        <Select 
          name="status"
          label="Status" 
          required
          options={[
            { value: 'Present', label: 'Present' },
            { value: 'Absent', label: 'Absent' },
          ]}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button 
          type="submit" 
          className="w-full md:w-auto px-12 py-3" 
          disabled={loading || employees.length === 0}
        >
          {loading ? 'Marking...' : 'Mark Attendance'}
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
